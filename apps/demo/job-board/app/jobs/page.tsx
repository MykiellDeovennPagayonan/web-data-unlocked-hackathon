"use client"

import { useEffect, useState } from "react"
import { JobList } from "@/components/jobs/job-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Plus, Search, MapPin, Filter, Bell, ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"

interface Job {
  id: string
  title: string
  description: string
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT"
  requirements: string | null
  status: "ACTIVE" | "CLOSED"
  createdAt: string
  updatedAt: string
  organizationId: string
  organization: {
    user: {
      name: string
    }
  }
  _count?: {
    applications: number
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs")
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

  const activeCount = jobs.filter(j => j.status === "ACTIVE").length

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface">
      {/* Search Hero */}
      <div className="bg-white border-b border-border-strong py-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="bg-white border border-border-strong rounded-lg shadow-sm p-2 flex flex-col md:flex-row gap-2 max-w-3xl">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 md:border-r border-border-strong">
              <Search className="h-5 w-5 text-text-muted flex-shrink-0" />
              <Input
                placeholder="Job title, keywords, or company"
                className="border-0 shadow-none focus-visible:ring-0 h-10 text-base placeholder:text-text-muted"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2">
              <MapPin className="h-5 w-5 text-text-muted flex-shrink-0" />
              <Input
                placeholder="Location"
                className="border-0 shadow-none focus-visible:ring-0 h-10 text-base placeholder:text-text-muted"
              />
            </div>
            <Button className="bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold h-10 px-6 rounded w-full md:w-auto">
              Find Jobs
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button variant="outline" size="sm" className="rounded-full border-border-strong text-text-secondary text-xs font-medium hover:bg-white">
            Easy Apply <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-full border-border-strong text-text-secondary text-xs font-medium hover:bg-white">
            Remote <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-full border-border-strong text-text-secondary text-xs font-medium hover:bg-white">
            Date Posted <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-full border-border-strong text-text-secondary text-xs font-medium hover:bg-white">
            Salary <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-full border-border-strong text-text-secondary text-xs font-medium hover:bg-white">
            Job Type <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-full border-border-strong text-text-secondary text-xs font-medium hover:bg-white">
            Company Rating <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
          <Button variant="ghost" size="sm" className="text-text-muted text-xs font-medium hover:text-text-primary ml-auto">
            <Filter className="h-3.5 w-3.5 mr-1" /> More Filters
          </Button>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {loading ? "Loading jobs..." : `${activeCount} jobs found`}
            </h1>
            <p className="text-sm text-text-muted">Showing most relevant results</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="text-text-secondary text-xs border-border-strong rounded hover:bg-white">
              <Bell className="h-3.5 w-3.5 mr-1.5" /> Create job alert
            </Button>
            {session?.user?.role === "ORGANIZATION" && (
              <Link href="/dashboard/jobs/new">
                <Button className="bg-glassdoor-green hover:bg-glassdoor-green-hover text-white text-xs font-bold rounded">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Post a Job
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Job List */}
        {loading ? (
          <div className="bg-white border border-border-strong rounded-lg p-12 text-center">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4">
                  <div className="w-12 h-12 bg-surface rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface rounded w-2/3" />
                    <div className="h-3 bg-surface rounded w-1/2" />
                    <div className="h-3 bg-surface rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <JobList jobs={jobs} />
        )}
      </div>
    </div>
  )
}
