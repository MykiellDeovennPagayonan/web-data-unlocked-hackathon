"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Globe, DollarSign, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"

interface ApiEndpoint {
  id: string
  name: string
  description: string | null
  forwardUrl: string
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

export default function MarketplacePage() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ApiEndpoint | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/endpoints")
      .then((r) => r.json())
      .then((d) => setEndpoints(d))
      .finally(() => setLoading(false))
  }, [])

  function copyUrl(id: string) {
    const url = `${window.location.origin}/api/proxy/${id}`
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading marketplace...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6" />
          API Marketplace
        </h1>
        <p className="text-muted-foreground">Browse and use APIs from organizations. First 50 calls per endpoint are free.</p>
      </div>

      {endpoints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No APIs available yet. Check back soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {endpoints.map((ep) => (
            <Card key={ep.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base">{ep.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {ep.orgProfile.user.name}
                      </Badge>
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${ep.pricePer1k}/1k
                      </Badge>
                    </div>
                  </div>
                </div>
                {ep.description && (
                  <CardDescription className="mt-1">{ep.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 truncate text-xs"
                    onClick={() => copyUrl(ep.id)}
                  >
                    {copied === ep.id ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    Copy Proxy URL
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedId(expandedId === ep.id ? null : ep.id)}
                  >
                    {expandedId === ep.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button size="sm" onClick={() => setSelected(ep)}>
                    Details
                  </Button>
                </div>

                {expandedId === ep.id && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Proxy URL:</p>
                      <code className="block bg-muted p-2 rounded break-all">
                        {typeof window !== "undefined" ? window.location.origin : ""}/api/proxy/{ep.id}
                      </code>
                    </div>
                    <p className="text-muted-foreground">
                      Pass your API key in <code className="bg-muted px-1 rounded">x-api-key</code> header.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Badge variant="outline">{selected.orgProfile.user.name}</Badge>
                <Badge variant="secondary">${selected.pricePer1k}/1k calls</Badge>
                <Badge variant="secondary">50 free trials</Badge>
              </div>

              {selected.description && (
                <p className="text-muted-foreground">{selected.description}</p>
              )}

              <div>
                <p className="font-medium mb-1">Proxy URL</p>
                <code className="block bg-muted p-2 rounded text-xs break-all">
                  {typeof window !== "undefined" ? window.location.origin : ""}/api/proxy/{selected.id}
                </code>
              </div>

              <div>
                <p className="font-medium mb-1">Usage</p>
                <code className="block bg-muted p-2 rounded text-xs whitespace-pre">
{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/proxy/${selected.id} \\
  -H "x-api-key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '${selected.samplePayload ?? "{}"}'`}
                </code>
              </div>

              {selected.samplePayload && (
                <div>
                  <p className="font-medium mb-1">Sample Payload</p>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                    {selected.samplePayload}
                  </pre>
                </div>
              )}

              {selected.sampleResponse && (
                <div>
                  <p className="font-medium mb-1">Sample Response</p>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                    {selected.sampleResponse}
                  </pre>
                </div>
              )}

              <Button className="w-full" onClick={() => copyUrl(selected.id)}>
                {copied === selected.id ? (
                  <><Check className="h-4 w-4 mr-2" />Copied!</>
                ) : (
                  <><Copy className="h-4 w-4 mr-2" />Copy Proxy URL</>
                )}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
