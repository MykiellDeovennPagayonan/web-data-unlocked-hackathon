"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/applications/status-badge"

interface Application {
  id: string
  status: "PENDING" | "INTERVIEWING" | "ACCEPTED" | "REJECTED"
  appliedAt: string
  job: {
    id: string
    title: string
    organization: {
      user: { name: string }
    }
  }
}

export default function MyApplicationsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState<string>("ALL")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch("/api/applications")
        if (response.ok) {
          const data = await response.json()
          setApplications(data)
        }
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  if (status === "loading" || !session || session.user.role !== "INDIVIDUAL") {
    return <div className="container mx-auto py-8 px-4">Loading...</div>
  }

  const filtered = filter === "ALL" ? applications : applications.filter(a => a.status === filter)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {["ALL", "PENDING", "INTERVIEWING", "ACCEPTED", "REJECTED"].map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
            {s}
          </Button>
        ))}
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="grid gap-4">
          {filtered.map(app => (
            <Card key={app.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{app.job.title}</CardTitle>
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-sm text-muted-foreground">{app.job.organization.user.name}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                <Link href={`/dashboard/applications/${app.id}`}>
                  <Button variant="outline" size="sm" className="mt-2">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p>No applications found.</p>}
        </div>
      )}
    </div>
  )
}
