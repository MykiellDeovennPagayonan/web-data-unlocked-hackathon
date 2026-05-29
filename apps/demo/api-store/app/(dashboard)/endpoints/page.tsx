"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Copy } from "lucide-react"

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
}

export default function EndpointsPage() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchEndpoints()
  }, [])

  async function fetchEndpoints() {
    const res = await fetch("/api/endpoints/mine")
    if (res.ok) setEndpoints(await res.json())
  }

  async function toggleActive(ep: ApiEndpoint) {
    await fetch(`/api/endpoints/${ep.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ep.isActive }),
    })
    fetchEndpoints()
  }

  async function confirmDelete() {
    if (!deleteId) return
    await fetch(`/api/endpoints/${deleteId}`, { method: "DELETE" })
    setDeleteId(null)
    fetchEndpoints()
  }

  function copyProxyUrl(id: string) {
    const url = `${window.location.origin}/api/proxy/${id}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Endpoints</h1>
          <p className="text-muted-foreground">Manage your API endpoints</p>
        </div>
        <Button asChild>
          <Link href="/endpoints/new">
            <Plus className="h-4 w-4 mr-2" />
            New Endpoint
          </Link>
        </Button>
      </div>

      {endpoints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t created any endpoints yet.</p>
            <Button asChild>
              <Link href="/endpoints/new">Create your first endpoint</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {endpoints.map((ep) => (
            <Card key={ep.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{ep.name}</CardTitle>
                      <Badge variant={ep.isActive ? "default" : "secondary"}>
                        {ep.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {ep.description && (
                      <CardDescription>{ep.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Copy proxy URL"
                      onClick={() => copyProxyUrl(ep.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title={ep.isActive ? "Deactivate" : "Activate"}
                      onClick={() => toggleActive(ep)}
                    >
                      {ep.isActive ? (
                        <ToggleRight className="h-4 w-4 text-primary" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/endpoints/${ep.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(ep.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Price: </span>
                    <span className="font-medium">${ep.pricePer1k}/1k calls</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground">Forward URL: </span>
                    <code className="text-xs bg-muted px-1 rounded truncate">{ep.forwardUrl}</code>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Proxy URL:{" "}
                  <code className="bg-muted px-1 rounded">
                    {typeof window !== "undefined" ? window.location.origin : ""}/api/proxy/{ep.id}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Endpoint?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete this endpoint and all associated usage logs.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
