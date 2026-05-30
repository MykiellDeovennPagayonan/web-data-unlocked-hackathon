"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Copy, Check, Loader2, AlertTriangle, DollarSign } from "lucide-react"

interface ApiEndpoint {
  id: string
  name: string
  description: string | null
  forwardUrl: string
  method: string
  samplePayload: string | null
  sampleResponse: string | null
  pricePer1k: number
  isActive: boolean
  createdAt: string
  orgProfile: {
    userId: string
    user: { name: string }
  }
}

interface ApiKey {
  id: string
  key: string
  createdAt: string
  updatedAt: string
}

interface RunResponse {
  status: number
  body: string
  error: string | null
}

function validMethod(m: string): "GET" | "POST" | "PUT" | "DELETE" {
  const v = ["GET", "POST", "PUT", "DELETE"] as const
  return v.includes(m as any) ? (m as "GET" | "POST" | "PUT" | "DELETE") : "POST"
}

export default function TryApiPage() {
  const params = useParams()
  const router = useRouter()
  const id = useMemo(() => {
    const raw = Array.isArray(params.id) ? params.id[0] : params.id
    return raw || ""
  }, [params.id])

  const [endpoint, setEndpoint] = useState<ApiEndpoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState<ApiKey | null>(null)
  const [keyLoading, setKeyLoading] = useState(true)
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("POST")
  const [body, setBody] = useState<string>("{}")
  const [bodyError, setBodyError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [response, setResponse] = useState<RunResponse | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    let ignore = false
    fetch(`/api/endpoints/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Endpoint not found")
        return r.json()
      })
      .then((d) => {
        if (ignore) return
        setEndpoint(d)
        setMethod(validMethod(d.method))
        setBody(d.samplePayload ?? "{}")
      })
      .catch(() => {
        if (!ignore) setEndpoint(null)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => { ignore = true }
  }, [id])

  useEffect(() => {
    let ignore = false
    fetch("/api/keys")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!ignore) setApiKey(d)
      })
      .catch(() => {
        if (!ignore) setApiKey(null)
      })
      .finally(() => {
        if (!ignore) setKeyLoading(false)
      })
    return () => { ignore = true }
  }, [])

  function validateBody(value: string) {
    if (method === "GET") {
      setBodyError(null)
      return
    }
    if (!value.trim()) {
      setBodyError(null)
      return
    }
    try {
      JSON.parse(value)
      setBodyError(null)
    } catch (err) {
      setBodyError("Invalid JSON: " + (err as Error).message)
    }
  }

  function handleBodyChange(value: string) {
    setBody(value)
    validateBody(value)
  }

  function handleMethodChange(newMethod: "GET" | "POST" | "PUT" | "DELETE") {
    setMethod(newMethod)
    if (newMethod === "GET") {
      setBodyError(null)
    } else {
      validateBody(body)
    }
  }

  async function copyProxyUrl() {
    const url = `${window.location.origin}/api/proxy/${id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Copy failed. Please copy the URL manually.")
    }
  }

  async function runRequest() {
    if (!apiKey) {
      router.push("/keys")
      return
    }
    if (bodyError) return

    setIsRunning(true)
    setResponse(null)

    const opts: RequestInit = {
      method,
      headers: {
        "x-api-key": apiKey.key,
        "content-type": "application/json",
      },
    }
    if (method !== "GET") {
      opts.body = body
    }

    try {
      const res = await fetch(`/api/proxy/${id}`, opts)
      const text = await res.text()
      setResponse({ status: res.status, body: text, error: null })
    } catch (err) {
      setResponse({ status: 0, body: "", error: (err as Error).message })
    } finally {
      setIsRunning(false)
    }
  }

  function formatResponseBody(text: string): string {
    if (!text.trim()) return ""
    try {
      const parsed = JSON.parse(text)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return text
    }
  }

  const [activeTab, setActiveTab] = useState<"overview" | "docs" | "changelog">("overview")

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-surface-muted rounded-xl animate-pulse" />
            <div className="h-48 bg-surface-muted rounded-xl animate-pulse" />
          </div>
          <div className="h-96 bg-surface-muted rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!endpoint) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Endpoint not found</h1>
        <Button asChild className="bg-kaggle-blue hover:bg-kaggle-blue-hover text-white">
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="text-text-secondary hover:text-text-primary">
          <Link href="/marketplace">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Link href="/marketplace" className="hover:text-kaggle-blue transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-text-primary font-medium">{endpoint.name}</span>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">{endpoint.name}</h1>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-surface-muted border border-border-light flex items-center justify-center">
              <span className="text-[10px] font-bold text-text-secondary">
                {endpoint.orgProfile?.user?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <span className="text-sm text-text-secondary">{endpoint.orgProfile?.user?.name ?? "Unknown"}</span>
          </div>
          <span className="text-xs text-text-muted">{new Date(endpoint.createdAt).toLocaleDateString()}</span>
          <Badge className="bg-sky-50 text-sky-600 border-0 text-xs font-medium">{endpoint.method}</Badge>
          <Badge variant="outline" className="text-xs border-border-light text-text-secondary">
            <DollarSign className="h-3 w-3 mr-0.5" />
            ${endpoint.pricePer1k}/1k
          </Badge>
          <Badge className="bg-sky-50 text-sky-600 border-0 text-xs font-medium">50 free</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-light">
        <div className="flex gap-6">
          {(["overview", "docs", "changelog"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-kaggle-blue text-kaggle-blue"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "overview" && (
            <>
              {endpoint.description && (
                <div className="bg-white border border-border-light rounded-xl p-6">
                  <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">Description</h2>
                  <p className="text-sm text-text-secondary leading-relaxed">{endpoint.description}</p>
                </div>
              )}

              <div className="bg-white border border-border-light rounded-xl p-6">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">Proxy URL</h2>
                <div className="flex items-center gap-2 bg-surface-muted rounded p-3">
                  <code className="text-xs font-mono text-text-primary break-all flex-1">{`${window.location.origin}/api/proxy/${endpoint.id}`}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyProxyUrl}
                    className="shrink-0 h-8 text-text-muted hover:text-text-primary"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {endpoint.sampleResponse && (
                <div className="bg-white border border-border-light rounded-xl p-6">
                  <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">Sample Response</h2>
                  <pre className="bg-surface-muted rounded p-4 text-xs font-mono text-text-primary overflow-auto max-h-60">
                    {endpoint.sampleResponse}
                  </pre>
                </div>
              )}
            </>
          )}

          {activeTab === "docs" && (
            <div className="bg-white border border-border-light rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">Code Samples</h2>
                <div className="bg-surface-muted rounded p-4">
                  <p className="text-xs font-mono text-text-primary mb-2">// cURL</p>
                  <pre className="text-xs font-mono text-text-primary overflow-auto">
                    {`curl -X ${endpoint.method} ${window.location.origin}/api/proxy/${endpoint.id} \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </div>
              <div>
                <p className="text-xs font-mono text-text-primary mb-2">// JavaScript</p>
                <div className="bg-surface-muted rounded p-4">
                  <pre className="text-xs font-mono text-text-primary overflow-auto">
                    {`fetch("${window.location.origin}/api/proxy/${endpoint.id}", {
  method: "${endpoint.method}",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${endpoint.samplePayload || "{}"})
})`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "changelog" && (
            <div className="bg-white border border-border-light rounded-xl p-6">
              <p className="text-sm text-text-muted">No changelog entries yet.</p>
            </div>
          )}

          {/* Request builder */}
          <div className="bg-white border border-border-light rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Test Endpoint</h2>
            {!keyLoading && !apiKey && (
              <div className="flex items-center gap-2 p-3 rounded bg-amber-50 text-amber-800 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  You need an API key to test endpoints.{" "}
                  <Link href="/keys" className="underline font-medium text-amber-900">
                    Generate one here
                  </Link>
                  .
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                aria-label="HTTP method"
                value={method}
                onChange={(e) => handleMethodChange(e.target.value as "GET" | "POST" | "PUT" | "DELETE")}
                className="h-9 rounded border border-border-light bg-white px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-kaggle-blue"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={copyProxyUrl}
                disabled={copied}
                className="shrink-0 h-9 border-border-light text-text-secondary hover:bg-surface-muted"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy URL
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={runRequest}
                disabled={isRunning || !!bodyError || keyLoading}
                className="shrink-0 h-9 bg-kaggle-blue hover:bg-kaggle-blue-hover text-white"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Run Request"
                )}
              </Button>
            </div>
            {method !== "GET" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-primary">Request Body (JSON)</label>
                <Textarea
                  value={body}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  rows={6}
                  className="font-mono text-sm bg-surface-muted border-border-light focus:border-kaggle-blue"
                />
                {bodyError && (
                  <p className="text-xs text-destructive">{bodyError}</p>
                )}
              </div>
            )}
          </div>

          {/* Response */}
          {response && (
            <div className="bg-white border border-border-light rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Response</h2>
                <Badge
                  className={
                    response.status >= 200 && response.status < 300
                      ? "bg-green-50 text-green-700 border-0"
                      : response.status >= 400 && response.status < 500
                      ? "bg-amber-50 text-amber-700 border-0"
                      : "bg-red-50 text-red-700 border-0"
                  }
                >
                  {response.status === 0 ? "Network Error" : `${response.status}`}
                </Badge>
              </div>
              {response.error && (
                <p className="text-sm text-destructive">{response.error}</p>
              )}
              {response.body && (
                <pre className="bg-surface-muted rounded p-4 text-xs font-mono text-text-primary overflow-auto max-h-96">
                  {formatResponseBody(response.body)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Right column — sticky metadata */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-border-light rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Actions</h3>
              <Button asChild className="w-full bg-kaggle-blue hover:bg-kaggle-blue-hover text-white h-10">
                <Link href="/keys">Get API Key</Link>
              </Button>
              <Button variant="outline" className="w-full h-10 border-border-light text-text-secondary hover:bg-surface-muted" onClick={copyProxyUrl}>
                Copy Proxy URL
              </Button>
            </div>

            <div className="bg-white border border-border-light rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Method</span>
                  <span className="font-mono text-text-primary">{endpoint.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Price</span>
                  <span className="text-text-primary">${endpoint.pricePer1k}/1k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Status</span>
                  <Badge className={endpoint.isActive ? "bg-green-50 text-green-700 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                    {endpoint.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Created</span>
                  <span className="text-text-primary">{new Date(endpoint.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border-light rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">Owner</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-muted border border-border-light flex items-center justify-center">
                  <span className="text-sm font-bold text-text-secondary">
                    {endpoint.orgProfile?.user?.name?.charAt(0).toUpperCase() ?? "?"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{endpoint.orgProfile?.user?.name ?? "Unknown"}</p>
                  <p className="text-xs text-text-muted">Organization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
