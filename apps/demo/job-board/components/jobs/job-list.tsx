"use client"

import { JobCard } from "./job-card"

interface JobWithOrganization {
  id: string
  title: string
  description: string
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT"
  requirements: string | null
  status: "ACTIVE" | "CLOSED"
  createdAt: Date | string
  updatedAt: Date | string
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

interface JobListProps {
  jobs: JobWithOrganization[]
}

export function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No jobs found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
