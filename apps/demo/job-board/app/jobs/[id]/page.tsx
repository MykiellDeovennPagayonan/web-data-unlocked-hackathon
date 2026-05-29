"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Users, ArrowLeft, Building2, Star, Bookmark, Share2, Clock, Briefcase } from "lucide-react"

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
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-surface flex items-center justify-center">
        <div className="text-text-muted">Loading job details...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-surface flex items-center justify-center">
        <div className="text-text-muted">Job not found</div>
      </div>
    )
  }

  const isOrganization = session?.user?.role === "ORGANIZATION"
  const isJobOwner = isOrganization && job.organizationId === session?.user?.orgProfileId
  const rating = 3.8 + Math.random() * 1.2
  const reviewCount = Math.floor(50 + Math.random() * 500)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <Link href="/jobs" className="inline-flex items-center text-text-secondary hover:text-text-primary text-sm mb-6 font-medium">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Job Header Card */}
            <div className="bg-white border border-border-strong rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-surface rounded flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-7 w-7 text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-text-primary leading-tight">{job.title}</h1>
                  <Link href="/jobs" className="text-glassdoor-green font-semibold hover:underline text-base">
                    {job.organization.user.name}
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(rating)
                              ? "text-glassdoor-green fill-glassdoor-green"
                              : "text-border-strong"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-text-primary">{rating.toFixed(1)}</span>
                    <span className="text-xs text-text-muted">({reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary mb-4">
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-text-muted" />
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-text-muted" />
                  <span>{jobTypeLabels[job.jobType]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-text-muted" />
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                {job._count && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-text-muted" />
                    <span>{job._count.applications} applicants</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs border-border-strong rounded px-2 py-0.5 text-text-secondary">
                  {job.status}
                </Badge>
                {job.status === "ACTIVE" && (
                  <Badge className="text-xs font-medium bg-glassdoor-green/10 text-glassdoor-green border-0 rounded px-2 py-0.5">
                    Easy Apply
                  </Badge>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white border border-border-strong rounded-lg p-6">
              <h2 className="text-lg font-bold text-text-primary mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white border border-border-strong rounded-lg p-6">
                <h2 className="text-lg font-bold text-text-primary mb-4">Requirements</h2>
                <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Company Overview */}
            <div className="bg-white border border-border-strong rounded-lg p-6">
              <h2 className="text-lg font-bold text-text-primary mb-3">About {job.organization.user.name}</h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                {job.organization.user.name} is a leading company in its industry, committed to innovation and employee growth.
                Join a team that values creativity, collaboration, and continuous learning.
              </p>
              <Link href="/jobs" className="text-glassdoor-green font-semibold text-sm hover:underline">
                See all {job.organization.user.name} jobs
              </Link>
            </div>
          </div>

          {/* Right Column - Sticky Apply Panel */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Apply Card */}
              <div className="bg-white border border-border-strong rounded-lg p-6">
                {(job.salaryMin || job.salaryMax) && (
                  <div className="mb-4">
                    <Badge className="text-sm font-bold bg-glassdoor-blue text-white border-0 rounded px-3 py-1">
                      {job.salaryMin && `$${(job.salaryMin / 1000).toFixed(0)}K`}
                      {job.salaryMin && job.salaryMax && " - "}
                      {job.salaryMax && `$${(job.salaryMax / 1000).toFixed(0)}K`} /yr
                    </Badge>
                    <p className="text-xs text-text-muted mt-1">Glassdoor Estimate</p>
                  </div>
                )}

                <div className="space-y-3">
                  {session?.user?.role === "INDIVIDUAL" && (
                    <>
                      {hasApplied ? (
                        <Button disabled variant="outline" className="w-full h-11 rounded font-bold text-text-muted border-border-strong">
                          Already Applied
                        </Button>
                      ) : job.status === "ACTIVE" ? (
                        <Link href={`/jobs/${job.id}/apply`} className="block">
                          <Button className="w-full h-11 bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold rounded">
                            Apply Now
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled variant="outline" className="w-full h-11 rounded font-bold text-text-muted border-border-strong">
                          No Longer Accepting Applications
                        </Button>
                      )}
                    </>
                  )}

                  {!session?.user && (
                    <Link href="/login" className="block">
                      <Button className="w-full h-11 bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold rounded">
                        Sign in to Apply
                      </Button>
                    </Link>
                  )}

                  {isJobOwner && (
                    <Link href={`/dashboard/jobs/${job.id}/applicants`} className="block">
                      <Button variant="outline" className="w-full h-11 rounded font-bold border-glassdoor-green text-glassdoor-green hover:bg-glassdoor-green/5">
                        View Applicants
                      </Button>
                    </Link>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-10 rounded border-border-strong text-text-secondary hover:bg-surface">
                      <Bookmark className="h-4 w-4 mr-1.5" /> Save
                    </Button>
                    <Button variant="outline" className="flex-1 h-10 rounded border-border-strong text-text-secondary hover:bg-surface">
                      <Share2 className="h-4 w-4 mr-1.5" /> Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Company Stats Card */}
              <div className="bg-white border border-border-strong rounded-lg p-6">
                <h3 className="font-bold text-text-primary mb-3">Company Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Size</span>
                    <span className="font-medium text-text-primary">51-200 employees</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Type</span>
                    <span className="font-medium text-text-primary">Private</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Industry</span>
                    <span className="font-medium text-text-primary">Technology</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Founded</span>
                    <span className="font-medium text-text-primary">2015</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
