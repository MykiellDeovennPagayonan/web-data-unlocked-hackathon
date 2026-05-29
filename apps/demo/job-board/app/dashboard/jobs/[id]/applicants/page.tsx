"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Download, User, Calendar, DollarSign, Clock } from "lucide-react"
import { StatusBadge } from "@/components/applications/status-badge"

interface Applicant {
  id: string
  status: "PENDING" | "INTERVIEWING" | "ACCEPTED" | "REJECTED"
  appliedAt: string
  coverLetter: string | null
  expectedSalary: number | null
  availability: string | null
  resumeUrl: string
  individual: {
    user: { name: string; email: string }
  }
}

export default function JobApplicantsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchApplicants() {
      try {
        const response = await fetch(`/api/organizations/jobs/${params.id}/applicants`)
        if (response.ok) {
          const data = await response.json()
          setApplicants(data)
        }
      } catch (error) {
        console.error("Error fetching applicants:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchApplicants()
  }, [params.id])

  async function updateStatus(applicantId: string, status: string) {
    try {
      const response = await fetch(`/api/organizations/applicants/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        setApplicants(applicants.map(a => a.id === applicantId ? { ...a, status: status as Applicant["status"] } : a))
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

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
        <Link href="/dashboard/jobs" className="inline-flex items-center text-text-secondary hover:text-text-primary text-sm mb-6 font-medium">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Jobs
        </Link>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Job Applicants</h1>
            <p className="text-sm text-text-muted mt-1">{applicants.length} total applicants</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-border-strong rounded-lg p-12 text-center">
            <div className="text-text-muted">Loading applicants...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {applicants.map(applicant => (
              <div key={applicant.id} className="bg-white border border-border-strong rounded-lg p-5 hover:border-glassdoor-green transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-surface rounded flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-text-muted" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">{applicant.individual.user.name}</h3>
                      <p className="text-sm text-text-secondary">{applicant.individual.user.email}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                        </span>
                        {applicant.expectedSalary && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> ${applicant.expectedSalary.toLocaleString()}
                          </span>
                        )}
                        {applicant.availability && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {applicant.availability}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={applicant.status} />
                </div>

                {applicant.coverLetter && (
                  <div className="mt-3 pt-3 border-t border-surface-alt">
                    <p className="text-sm text-text-secondary leading-relaxed">{applicant.coverLetter}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-surface-alt">
                  <Select defaultValue={applicant.status} onValueChange={(v) => updateStatus(applicant.id, v)}>
                    <SelectTrigger className="w-40 h-9 text-xs border-border-strong rounded">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="rounded border-border-strong text-text-secondary hover:bg-surface text-xs">
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Download CSV
                    </Button>
                  </a>
                </div>
              </div>
            ))}
            {applicants.length === 0 && (
              <div className="bg-white border border-border-strong rounded-lg p-12 text-center">
                <p className="text-text-muted text-lg mb-2">No applicants yet</p>
                <p className="text-text-muted text-sm">Applicants will appear here once they apply</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
