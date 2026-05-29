"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Clock, Building2, Star, Bookmark } from "lucide-react"

type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT"
type JobStatus = "ACTIVE" | "CLOSED"

interface JobWithOrganization {
  id: string
  title: string
  description: string
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  jobType: JobType
  requirements: string | null
  status: JobStatus
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

interface JobCardProps {
  job: JobWithOrganization
}

const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract"
}

function timeAgo(date: Date | string) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function JobCard({ job }: JobCardProps) {
  const rating = 3.5 + Math.random() * 1.5 // Mock rating for visual demo
  const reviewCount = Math.floor(20 + Math.random() * 300)

  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div className="bg-white border-b border-surface-alt hover:bg-surface transition-colors cursor-pointer p-4 md:p-5">
        <div className="flex gap-4">
          {/* Company Logo Placeholder */}
          <div className="flex-shrink-0 w-12 h-12 bg-surface rounded flex items-center justify-center">
            <Building2 className="h-6 w-6 text-text-muted" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title and Actions Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-text-primary leading-snug hover:underline">
                  {job.title}
                </h3>
                <p className="text-sm text-glassdoor-green font-medium mt-0.5 hover:underline">
                  {job.organization.user.name}
                </p>
              </div>
              <button
                onClick={(e) => e.preventDefault()}
                className="flex-shrink-0 text-text-muted hover:text-glassdoor-green transition-colors"
                aria-label="Save job"
              >
                <Bookmark className="h-5 w-5" />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= Math.round(rating)
                        ? "text-glassdoor-green fill-glassdoor-green"
                        : "text-border-strong"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-text-primary">{rating.toFixed(1)}</span>
              <span className="text-xs text-text-muted">({reviewCount})</span>
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-text-secondary">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-text-muted" />
                  <span>{job.location}</span>
                </div>
              )}
              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-text-muted" />
                  <span>
                    {job.salaryMin && `$${(job.salaryMin / 1000).toFixed(0)}K`}
                    {job.salaryMin && job.salaryMax && " - "}
                    {job.salaryMax && `$${(job.salaryMax / 1000).toFixed(0)}K`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-text-muted" />
                <span>{timeAgo(job.createdAt)}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs font-normal text-text-secondary border-border-strong rounded px-2 py-0.5">
                {jobTypeLabels[job.jobType]}
              </Badge>
              {job.status === "ACTIVE" && (
                <Badge className="text-xs font-medium bg-glassdoor-green/10 text-glassdoor-green border-0 rounded px-2 py-0.5">
                  Easy Apply
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
