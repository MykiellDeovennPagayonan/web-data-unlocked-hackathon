"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Users, ArrowLeft, Building } from "lucide-react"

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
      email: string
    }
  }
  _count?: {
    applications: number
  }
}

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract"
}

export default function JobDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/api/jobs/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setJob(data)
        }
      } catch (error) {
        console.error("Error fetching job:", error)
      } finally {
        setLoading(false)
      }
    }

    async function checkApplication() {
      if (session?.user?.role === "INDIVIDUAL") {
        try {
          const response = await fetch("/api/applications")
          if (response.ok) {
            const applications = await response.json()
            const applied = applications.some((app: { jobId: string }) => app.jobId === params.id)
            setHasApplied(applied)
          }
        } catch (error) {
          console.error("Error checking applications:", error)
        }
      }
    }

    fetchJob()
    checkApplication()
  }, [params.id, session])

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>
  }

  if (!job) {
    return <div className="container mx-auto py-8 px-4">Job not found</div>
  }

  const isOrganization = session?.user?.role === "ORGANIZATION"
  const isJobOwner = isOrganization && job.organizationId === session?.user?.orgProfileId

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/jobs" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Jobs
      </Link>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>{job.organization.user.name}</span>
              </div>
            </div>
            <Badge variant={job.status === "ACTIVE" ? "default" : "secondary"}>
              {job.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
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
            <Badge variant="outline">{jobTypeLabels[job.jobType]}</Badge>
            {job._count && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{job._count.applications} applicants</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.requirements && (
            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {session?.user?.role === "INDIVIDUAL" && (
              <>
                {hasApplied ? (
                  <Button disabled variant="outline">
                    Already Applied
                  </Button>
                ) : job.status === "ACTIVE" ? (
                  <Link href={`/jobs/${job.id}/apply`}>
                    <Button>Apply Now</Button>
                  </Link>
                ) : (
                  <Button disabled variant="outline">
                    No Longer Accepting Applications
                  </Button>
                )}
              </>
            )}

            {isJobOwner && (
              <Link href={`/dashboard/jobs/${job.id}/applicants`}>
                <Button variant="outline">View Applicants</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
