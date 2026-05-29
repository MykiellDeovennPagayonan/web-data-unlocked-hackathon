"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/applications/status-badge"
import { ArrowLeft, Download } from "lucide-react"

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
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link href="/dashboard/applications" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Applications
      </Link>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{application.job.title}</CardTitle>
              <p className="text-muted-foreground">{application.job.organization.user.name}</p>
            </div>
            <StatusBadge status={application.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Applied: {new Date(application.appliedAt).toLocaleDateString()}</p>

          {application.coverLetter && (
            <div>
              <h3 className="font-semibold mb-1">Cover Letter</h3>
              <p className="text-muted-foreground">{application.coverLetter}</p>
            </div>
          )}

          {application.expectedSalary && (
            <div>
              <h3 className="font-semibold mb-1">Expected Salary</h3>
              <p className="text-muted-foreground">${application.expectedSalary.toLocaleString()}</p>
            </div>
          )}

          {application.availability && (
            <div>
              <h3 className="font-semibold mb-1">Availability</h3>
              <p className="text-muted-foreground">{application.availability}</p>
            </div>
          )}

          <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="mt-2">
              <Download className="h-4 w-4 mr-2" /> Download Uploaded CSV
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
