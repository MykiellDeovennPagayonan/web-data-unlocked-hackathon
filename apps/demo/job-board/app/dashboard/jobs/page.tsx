"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, ArrowRight, Building2 } from "lucide-react"

interface Job {
  id: string
  title: string
  status: "ACTIVE" | "CLOSED"
  createdAt: string
  _count: { applications: number }
}

export default function MyJobsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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

  if (status === "loading" || !session || session.user.role !== "ORGANIZATION") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-surface flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Job Postings</h1>
            <p className="text-sm text-text-muted mt-1">Manage your job listings and applicants</p>
          </div>
          <Link href="/dashboard/jobs/new">
            <Button className="bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold rounded">
              <Plus className="h-4 w-4 mr-2" /> Post New Job
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-border-strong rounded-lg p-12 text-center">
            <div className="text-text-muted">Loading jobs...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="bg-white border border-border-strong rounded-lg p-5 hover:border-glassdoor-green transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-surface rounded flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-text-muted" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">{job.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {job._count.applications} applicants
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={job.status === "ACTIVE"
                    ? "bg-glassdoor-green/10 text-glassdoor-green border-0 rounded"
                    : "bg-surface text-text-muted border-0 rounded"
                  }>
                    {job.status}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-surface-alt">
                  <Link href={`/dashboard/jobs/${job.id}/applicants`}>
                    <Button variant="outline" size="sm" className="rounded border-glassdoor-green text-glassdoor-green hover:bg-glassdoor-green/5 text-xs font-medium">
                      View Applicants <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="bg-white border border-border-strong rounded-lg p-12 text-center">
                <p className="text-text-muted text-lg mb-2">No jobs posted yet</p>
                <p className="text-text-muted text-sm mb-6">Start recruiting by posting your first job opening</p>
                <Link href="/dashboard/jobs/new">
                  <Button className="bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold rounded">
                    <Plus className="h-4 w-4 mr-2" /> Post New Job
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
