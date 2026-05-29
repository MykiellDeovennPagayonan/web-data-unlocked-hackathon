"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Copy, Check, Loader2, AlertTriangle } from "lucide-react"

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

export default function TryApiPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [endpoint, setEndpoint] = useState<ApiEndpoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState<ApiKey | null>(null)
  const [keyLoading, setKeyLoading] = useState(true)

  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("POST")
  const [body, setBody] = useState<string>("{}")

  const validMethod = (m: string): "GET" | "POST" | "PUT" | "DELETE" => {
    const v = ["GET", "POST", "PUT", "DELETE"] as const
    return v.includes(m as any) ? (m as "GET" | "POST" | "PUT" | "DELETE") : "POST"
  }
  const [bodyError, setBodyError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [response, setResponse] = useState<RunResponse | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/endpoints/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Endpoint not found")
        return r.json()
      })
      .then((d) => {
        setEndpoint(d)
        setMethod(validMethod(d.method))
        setBody(d.samplePayload ?? "{}")
      })
      .catch(() => setEndpoint(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetch("/api/keys")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setApiKey(d))
      .catch(() => setApiKey(null))
      .finally(() => setKeyLoading(false))
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
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  if (loading) {
    return <div className="text-muted-foreground">Loading endpoint...</div>
  }

  if (!endpoint) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Endpoint not found</h1>
        <Button asChild>
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    )
  }

  const proxyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/proxy/${endpoint.id}`

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/marketplace">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Try API</h1>
          <p className="text-muted-foreground">Test this endpoint with a live request</p>
        </div>
      </div>

      {/* Endpoint info card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle>{endpoint.name}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {endpoint.orgProfile.user.name}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ${endpoint.pricePer1k}/1k
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  50 free trials
                </Badge>
              </div>
            </div>
          </div>
          {endpoint.description && (
            <CardDescription>{endpoint.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Proxy URL</p>
            <code className="block bg-muted p-2 rounded text-xs break-all">{proxyUrl}</code>
          </div>

          {endpoint.sampleResponse && (
            <div>
              <p className="text-sm font-medium mb-1">Sample Response</p>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                {endpoint.sampleResponse}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request builder card */}
      <Card>
        <CardHeader>
          <CardTitle>Send Request</CardTitle>
          <CardDescription>
            Choose a method, edit the request body, and click Run.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!keyLoading && !apiKey && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 text-amber-900 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                You need an API key to test endpoints.{" "}
                <Link href="/keys" className="underline font-medium">
                  Generate one here
                </Link>
                .
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={method}
              onChange={(e) =>
                handleMethodChange(e.target.value as "GET" | "POST" | "PUT" | "DELETE")
              }
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Proxy URL
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={runRequest}
              disabled={isRunning || !!bodyError || keyLoading}
              className="shrink-0"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Running...
                </>
              ) : (
                "Run"
              )}
            </Button>
          </div>

          {method !== "GET" && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Request Body (JSON)</label>
              <Textarea
                value={body}
                onChange={(e) => handleBodyChange(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              {bodyError && (
                <p className="text-xs text-destructive">{bodyError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response card */}
      {response && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle>Response</CardTitle>
              <Badge
                variant={
                  response.status >= 200 && response.status < 300
                    ? "default"
                    : response.status >= 400 && response.status < 500
                    ? "secondary"
                    : "destructive"
                }
              >
                {response.status === 0 ? "Network Error" : `${response.status}`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {response.error && (
              <p className="text-sm text-destructive">{response.error}</p>
            )}
            {response.body && (
              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-96">
                {formatResponseBody(response.body)}
              </pre>
            )}
            {!response.body && !response.error && (
              <p className="text-sm text-muted-foreground">Empty response body</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
