"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
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
    return <div className="container mx-auto py-8 px-4">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/dashboard/jobs" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Jobs
      </Link>
      <h1 className="text-3xl font-bold mb-6">Job Applicants</h1>
      {loading ? <p>Loading...</p> : (
        <div className="grid gap-4">
          {applicants.map(applicant => (
            <Card key={applicant.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{applicant.individual.user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{applicant.individual.user.email}</p>
                  </div>
                  <StatusBadge status={applicant.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Applied: {new Date(applicant.appliedAt).toLocaleDateString()}</p>
                {applicant.coverLetter && <p className="text-sm"><strong>Cover Letter:</strong> {applicant.coverLetter}</p>}
                {applicant.expectedSalary && <p className="text-sm"><strong>Expected Salary:</strong> ${applicant.expectedSalary.toLocaleString()}</p>}
                {applicant.availability && <p className="text-sm"><strong>Availability:</strong> {applicant.availability}</p>}
                <div className="flex items-center gap-4 pt-2">
                  <Select defaultValue={applicant.status} onValueChange={(v) => updateStatus(applicant.id, v)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Download CSV</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
          {applicants.length === 0 && <p>No applicants yet.</p>}
        </div>
      )}
    </div>
  )
}
