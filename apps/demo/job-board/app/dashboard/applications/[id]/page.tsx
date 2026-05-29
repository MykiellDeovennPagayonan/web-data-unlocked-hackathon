"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/applications/status-badge"
import { ArrowLeft, Download, Clock } from "lucide-react"

interface Application {
  id: string
  status: "PENDING" | "INTERVIEWING" | "ACCEPTED" | "REJECTED"
  appliedAt: string
  coverLetter: string | null
  expectedSalary: number | null
  availability: string | null
  resumeUrl: string
  job: {
    id: string
    title: string
    organization: {
      user: { name: string }
    }
  }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchApplication() {
      try {
        const response = await fetch(`/api/applications/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setApplication(data)
        }
      } catch (error) {
        console.error("Error fetching application:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchApplication()
  }, [params.id])

  if (status === "loading" || !session || session.user.role !== "INDIVIDUAL") {
    return <div className="container mx-auto py-8 px-4">Loading...</div>
  }

  if (loading) return <div className="container mx-auto py-8 px-4">Loading...</div>
  if (!application) return <div className="container mx-auto py-8 px-4">Application not found.</div>

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface">
      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-8">
        <Link href="/dashboard/applications" className="inline-flex items-center text-text-secondary hover:text-text-primary text-sm mb-6 font-medium">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Applications
        </Link>

        <div className="bg-white border border-border-strong rounded-lg p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-text-primary">{application.job.title}</h1>
              <p className="text-glassdoor-green font-semibold text-sm mt-0.5">{application.job.organization.user.name}</p>
            </div>
            <StatusBadge status={application.status} />
          </div>

          <div className="flex items-center gap-1 text-sm text-text-muted mb-6 pb-6 border-b border-surface-alt">
            <Clock className="h-3.5 w-3.5" />
            <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
          </div>

          <div className="space-y-5">
            {application.coverLetter && (
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Cover Letter</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{application.coverLetter}</p>
              </div>
            )}

            {application.expectedSalary && (
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Expected Salary</h3>
                <p className="text-sm text-text-secondary">${application.expectedSalary.toLocaleString()}</p>
              </div>
            )}

            {application.availability && (
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Availability</h3>
                <p className="text-sm text-text-secondary">{application.availability}</p>
              </div>
            )}

            <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
              <Button variant="outline" className="rounded border-glassdoor-green text-glassdoor-green hover:bg-glassdoor-green/5 text-xs font-medium">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download Uploaded CSV
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
