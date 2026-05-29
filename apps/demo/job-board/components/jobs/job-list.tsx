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
      <div className="bg-white border border-border-strong rounded-lg p-12 text-center">
        <p className="text-text-muted text-lg mb-2">No jobs found</p>
        <p className="text-text-muted text-sm">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border-strong rounded-lg overflow-hidden">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
