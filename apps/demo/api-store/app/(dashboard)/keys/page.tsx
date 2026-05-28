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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Key className="h-6 w-6" />
          API Key
        </h1>
        <p className="text-muted-foreground">Your global API key for accessing endpoints through this platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Key</CardTitle>
          <CardDescription>
            Use this key in the <code className="bg-muted px-1 rounded text-xs">x-api-key</code> header when calling any endpoint proxy URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKey ? (
            <>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-3 rounded font-mono text-sm truncate">
                  {apiKey.key}
                </code>
                <Button variant="outline" size="sm" onClick={copyKey}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                <span>Last updated: {new Date(apiKey.updatedAt).toLocaleDateString()}</span>
              </div>

              <Button
                variant="outline"
                onClick={() => setRegenOpen(true)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate Key
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">You don&apos;t have an API key yet.</p>
              <Button onClick={generateKey} disabled={generating}>
                {generating ? "Generating..." : "Generate API Key"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-2">1. Find an endpoint in the Marketplace</p>
            <p className="text-muted-foreground">Browse available APIs and copy the proxy URL for any endpoint.</p>
          </div>
          <div>
            <p className="font-medium mb-2">2. Make a request with your API key</p>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`curl -X POST https://api-store.app/api/proxy/{endpointId} \\
  -H "x-api-key: ${apiKey?.key ?? "your_api_key_here"}" \\
  -H "Content-Type: application/json" \\
  -d '{"key": "value"}'`}
            </pre>
          </div>
          <div>
            <p className="font-medium mb-2">3. Free trials</p>
            <p className="text-muted-foreground">
              Each endpoint gives you <Badge variant="secondary">50 free calls</Badge>. After that, calls deduct from your credit balance based on the endpoint&apos;s pricing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regenerate confirmation dialog */}
      <Dialog open={regenOpen} onOpenChange={setRegenOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Regenerate API Key?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Your old key will stop working immediately. Any integrations using the current key will break.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setRegenOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={generateKey} disabled={generating}>
              {generating ? "Generating..." : "Regenerate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
