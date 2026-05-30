"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEndpoints()
  }, [])

  async function fetchEndpoints() {
    try {
      const res = await fetch("/api/endpoints/mine")
      if (!res.ok) {
        setError("Failed to load endpoints.")
        return
      }
      setError(null)
      setEndpoints(await res.json())
    } catch {
      setError("Failed to load endpoints.")
    }
  }

  async function toggleActive(ep: ApiEndpoint) {
    try {
      const res = await fetch(`/api/endpoints/${ep.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !ep.isActive }),
      })
      if (res.ok) {
        await fetchEndpoints()
      } else {
        toast.error("Failed to update endpoint status. Please try again.")
      }
    } catch {
      toast.error("Failed to update endpoint status. Please try again.")
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/endpoints/${deleteId}`, { method: "DELETE" })
      if (res.ok) {
        setDeleteId(null)
        await fetchEndpoints()
      } else {
        toast.error("Failed to delete endpoint. Please try again.")
      }
    } catch {
      toast.error("Failed to delete endpoint. Please try again.")
    }
  }

  async function copyProxyUrl(id: string) {
    const url = `${window.location.origin}/api/proxy/${id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      toast.error("Copy failed. Please copy the URL manually.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">My Endpoints</h1>
          <p className="text-text-secondary mt-1">Manage your API endpoints</p>
        </div>
        <Button asChild className="bg-kaggle-blue hover:bg-kaggle-blue-hover text-white h-10">
          <Link href="/endpoints/new">
            <Plus className="h-4 w-4 mr-2" />
            New Endpoint
          </Link>
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive text-center py-8 border border-border-light rounded-xl bg-white">
          {error}
        </div>
      )}
      {!error && endpoints.length === 0 ? (
        <div className="bg-white border border-border-light rounded-xl py-16 text-center">
          <p className="text-text-secondary mb-4">You haven&apos;t created any endpoints yet.</p>
          <Button asChild className="bg-kaggle-blue hover:bg-kaggle-blue-hover text-white">
            <Link href="/endpoints/new">Create your first endpoint</Link>
          </Button>
        </div>
      ) : !error ? (
        <div className="space-y-4">
          {endpoints.map((ep) => (
            <div key={ep.id} className="bg-white border border-border-light rounded-xl p-5 hover:bg-surface transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-text-primary">{ep.name}</h3>
                    <Badge className={ep.isActive ? "bg-green-50 text-green-700 border-0 text-xs font-medium" : "bg-gray-100 text-gray-600 border-0 text-xs font-medium"}>
                      {ep.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {ep.description && (
                    <p className="text-sm text-text-secondary">{ep.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Copy proxy URL"
                    onClick={() => copyProxyUrl(ep.id)}
                    className="h-8 w-8 p-0 text-text-muted hover:text-text-primary"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={ep.isActive ? "Deactivate" : "Activate"}
                    onClick={() => toggleActive(ep)}
                    className="h-8 w-8 p-0 text-text-muted hover:text-text-primary"
                  >
                    {ep.isActive ? (
                      <ToggleRight className="h-4 w-4 text-kaggle-blue" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 text-text-muted hover:text-text-primary">
                    <Link href={`/endpoints/${ep.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(ep.id)}
                    className="h-8 w-8 p-0 text-text-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border-subtle space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-text-muted">Price: </span>
                    <span className="font-medium text-text-primary">${ep.pricePer1k}/1k calls</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-text-muted">Forward URL: </span>
                    <code className="text-xs bg-surface-muted px-1.5 py-0.5 rounded font-mono text-text-primary">{ep.forwardUrl}</code>
                  </div>
                </div>
                <div className="text-xs text-text-muted">
                  Proxy URL:{" "}
                  <code className="bg-surface-muted px-1.5 py-0.5 rounded font-mono text-text-primary">
                    {typeof window !== "undefined" ? window.location.origin : ""}/api/proxy/{ep.id}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm bg-white border-border-light">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Delete Endpoint?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">
            This will permanently delete this endpoint and all associated usage logs.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1 border-border-light text-text-secondary hover:bg-surface-muted" onClick={() => setDeleteId(null)}>
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
