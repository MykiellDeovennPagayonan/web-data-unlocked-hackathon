"use client"

import { useEffect, useState } from "react"
import { JobList } from "@/components/jobs/job-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Listings</h1>
        {session?.user?.role === "ORGANIZATION" && (
          <Link href="/dashboard/jobs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading jobs...</div>
      ) : (
        <JobList jobs={jobs} />
      )}
    </div>
  )
}
