"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, DollarSign, Copy, Check, ArrowRight } from "lucide-react"
import Link from "next/link"

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
                  <Button size="sm" asChild>
                    <Link href={`/marketplace/${ep.id}`}>
                      Try it
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  )
}
