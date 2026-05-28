"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users } from "lucide-react"

interface Job {
  id: string
  title: string
  status: "ACTIVE" | "CLOSED"
  createdAt: string
  _count: { applications: number }
}

export default function MyJobsPage() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/organizations/jobs")
        if (response.ok) {
          const data = await response.json()
          setJobs(data)
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  if (!session || session.user.role !== "ORGANIZATION") {
    return <div className="container mx-auto py-8 px-4">Please sign in as an organization.</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Job Postings</h1>
        <Link href="/dashboard/jobs/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Post New Job</Button>
        </Link>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <Card key={job.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <Badge variant={job.status === "ACTIVE" ? "default" : "secondary"}>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {job._count.applications} applicants</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/jobs/${job.id}/applicants`}><Button variant="outline" size="sm">View Applicants</Button></Link>
                  <Link href={`/dashboard/jobs/${job.id}/edit`}><Button variant="outline" size="sm">Edit</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {jobs.length === 0 && <p>No jobs posted yet.</p>}
        </div>
      )}
    </div>
  )
}
