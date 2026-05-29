"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UploadButton } from "@/components/uploadthing"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [resumeUrl, setResumeUrl] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading" || !session || session.user.role !== "INDIVIDUAL") {
    return <div className="container mx-auto py-8 px-4">Loading...</div>
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!resumeUrl) {
      setError("Please upload your CSV file")
      return
    }

    setLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: params.id,
          coverLetter: formData.get("coverLetter"),
          expectedSalary: formData.get("expectedSalary"),
          availability: formData.get("availability"),
          resumeUrl
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to submit application")
      }

      router.push("/dashboard/applications")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface">
      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-8">
        <Link href={`/jobs/${params.id}`} className="inline-flex items-center text-text-secondary hover:text-text-primary text-sm mb-6 font-medium">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Job
        </Link>

        <div className="bg-white border border-border-strong rounded-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Apply for Job</h1>
          <p className="text-sm text-text-secondary mb-6">Complete the form below to submit your application</p>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Cover Letter</label>
              <Textarea
                name="coverLetter"
                placeholder="Why are you a good fit for this role?"
                rows={4}
                className="border-border-strong focus-visible:ring-glassdoor-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Expected Salary</label>
              <Input
                name="expectedSalary"
                type="number"
                placeholder="e.g., 50000"
                className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Availability</label>
              <Input
                name="availability"
                placeholder="e.g., Immediately, 2 weeks notice"
                className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Upload CSV Resume</label>
              <div className="mt-2 p-4 bg-surface border border-dashed border-border-strong rounded-lg">
                {resumeUrl ? (
                  <p className="text-glassdoor-green text-sm font-medium">File uploaded successfully!</p>
                ) : (
                  <UploadButton
                    endpoint="resumeUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]) setResumeUrl(res[0].url)
                    }}
                    onUploadError={(err) => setError(err.message)}
                  />
                )}
              </div>
            </div>
            {error && <p className="text-danger text-sm font-medium">{error}</p>}
            <Button
              type="submit"
              className="w-full h-11 bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold rounded"
              disabled={loading || !resumeUrl}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
