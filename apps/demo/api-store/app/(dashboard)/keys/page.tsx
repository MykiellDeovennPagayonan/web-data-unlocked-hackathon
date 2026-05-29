"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key, Copy, Check, RefreshCw, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ApiKey {
  id: string
  key: string
  createdAt: string
  updatedAt: string
}

export default function KeysPage() {
  const [apiKey, setApiKey] = useState<ApiKey | null>(null)
  const [copied, setCopied] = useState(false)
  const [regenOpen, setRegenOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchKey()
  }, [])

  async function fetchKey() {
    const res = await fetch("/api/keys")
    if (res.ok) {
      const data = await res.json()
      setApiKey(data)
    }
  }

  async function generateKey() {
    setGenerating(true)
    const res = await fetch("/api/keys", { method: "POST" })
    if (res.ok) setApiKey(await res.json())
    setGenerating(false)
    setRegenOpen(false)
  }

  async function copyKey() {
    if (!apiKey) return
    await navigator.clipboard.writeText(apiKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight flex items-center gap-2">
          <Key className="h-6 w-6" />
          API Key
        </h1>
        <p className="text-text-secondary mt-1">Your global API key for accessing endpoints through this platform</p>
      </div>

      <div className="bg-white border border-border-light rounded-xl p-6">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-1">Your API Key</h2>
        <p className="text-sm text-text-secondary mb-4">
          Use this key in the <code className="bg-surface-muted px-1.5 py-0.5 rounded text-xs font-mono">x-api-key</code> header when calling any endpoint proxy URL.
        </p>
        {apiKey ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-surface-muted px-3 py-3 rounded text-sm font-mono text-text-primary truncate">
                {apiKey.key}
              </code>
              <Button variant="outline" size="sm" onClick={copyKey} className="h-9 border-border-light hover:bg-surface-muted">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
              <span>Last updated: {new Date(apiKey.updatedAt).toLocaleDateString()}</span>
            </div>

            <Button
              variant="outline"
              onClick={() => setRegenOpen(true)}
              className="flex items-center gap-2 h-9 border-border-light text-text-secondary hover:bg-surface-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate Key
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">You don&apos;t have an API key yet.</p>
            <Button onClick={generateKey} disabled={generating} className="bg-kaggle-blue hover:bg-kaggle-blue-hover text-white h-9">
              {generating ? "Generating..." : "Generate API Key"}
            </Button>
          </div>
        )}
      </div>

      {/* Usage instructions */}
      <div className="bg-white border border-border-light rounded-xl p-6">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4">How to Use</h2>
        <div className="space-y-5 text-sm">
          <div>
            <p className="font-medium text-text-primary mb-2">1. Find an endpoint in the Marketplace</p>
            <p className="text-text-secondary">Browse available APIs and copy the proxy URL for any endpoint.</p>
          </div>
          <div>
            <p className="font-medium text-text-primary mb-2">2. Make a request with your API key</p>
            <pre className="bg-surface-muted rounded p-4 text-xs font-mono text-text-primary overflow-auto">
{`curl -X POST https://api-store.app/api/proxy/{endpointId} \
  -H "x-api-key: ${apiKey?.key ?? "your_api_key_here"}" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'`}
            </pre>
          </div>
          <div>
            <p className="font-medium text-text-primary mb-2">3. Free trials</p>
            <p className="text-text-secondary">
              Each endpoint gives you <Badge className="bg-sky-50 text-sky-600 border-0 text-xs font-medium">50 free calls</Badge>. After that, calls deduct from your credit balance based on the endpoint&apos;s pricing.
            </p>
          </div>
        </div>
      </div>

      {/* Regenerate confirmation dialog */}
      <Dialog open={regenOpen} onOpenChange={setRegenOpen}>
        <DialogContent className="sm:max-w-sm bg-white border-border-light">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-text-primary">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Regenerate API Key?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">
            Your old key will stop working immediately. Any integrations using the current key will break.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1 border-border-light text-text-secondary hover:bg-surface-muted" onClick={() => setRegenOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-kaggle-blue hover:bg-kaggle-blue-hover text-white" onClick={generateKey} disabled={generating}>
              {generating ? "Generating..." : "Regenerate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
