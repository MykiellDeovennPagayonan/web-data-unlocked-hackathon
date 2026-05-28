"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Users } from "lucide-react"

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

const statusColors: Record<JobStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800"
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg line-clamp-1">{job.title}</CardTitle>
            <Badge className={statusColors[job.status]}>
              {job.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {job.organization.user.name}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2 text-sm">
            {job.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            )}
            {(job.salaryMin || job.salaryMax) && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>
                  {job.salaryMin && `$${job.salaryMin.toLocaleString()}`}
                  {job.salaryMin && job.salaryMax && " - "}
                  {job.salaryMax && `$${job.salaryMax.toLocaleString()}`}
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <Badge variant="outline">{jobTypeLabels[job.jobType]}</Badge>
            {job._count && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{job._count.applications} applicants</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
