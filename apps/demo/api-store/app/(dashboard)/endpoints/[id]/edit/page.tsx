"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

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
}

export default function EditEndpointPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [endpoint, setEndpoint] = useState<ApiEndpoint | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/endpoints/${id}`)
      .then((r) => r.json())
      .then((d) => setEndpoint(d))
  }, [id])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const fd = new FormData(e.currentTarget)
    const data = {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      forwardUrl: fd.get("forwardUrl") as string,
      method: fd.get("method") as string,
      samplePayload: (fd.get("samplePayload") as string) || undefined,
      sampleResponse: (fd.get("sampleResponse") as string) || undefined,
      pricePer1k: parseFloat(fd.get("pricePer1k") as string) || 1.0,
    }

    try {
      const res = await fetch(`/api/endpoints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.message || "Something went wrong")
        return
      }
      router.push("/endpoints")
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (!endpoint) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/endpoints">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Endpoint</h1>
          <p className="text-muted-foreground">Update your API endpoint configuration</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Details</CardTitle>
          <CardDescription>Changes will apply to all future proxy requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input name="name" defaultValue={endpoint.name} required disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" defaultValue={endpoint.description ?? ""} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Forward URL *</label>
              <Input name="forwardUrl" type="url" defaultValue={endpoint.forwardUrl} required disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">HTTP Method</label>
              <select
                name="method"
                defaultValue={endpoint.method || "POST"}
                disabled={isLoading}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Price per 1,000 calls (USD)</label>
              <Input
                name="pricePer1k"
                type="number"
                defaultValue={endpoint.pricePer1k}
                min="0.001"
                step="0.001"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sample Payload (JSON)</label>
              <Textarea
                name="samplePayload"
                defaultValue={endpoint.samplePayload ?? ""}
                className="font-mono text-sm"
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sample Response (JSON)</label>
              <Textarea
                name="sampleResponse"
                defaultValue={endpoint.sampleResponse ?? ""}
                className="font-mono text-sm"
                rows={4}
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/endpoints">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
