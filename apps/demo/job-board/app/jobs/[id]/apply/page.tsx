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
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link href={`/jobs/${params.id}`} className="flex items-center text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Job
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Apply for Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cover Letter</label>
              <Textarea name="coverLetter" placeholder="Why are you a good fit for this role?" rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium">Expected Salary</label>
              <Input name="expectedSalary" type="number" placeholder="e.g., 50000" />
            </div>
            <div>
              <label className="text-sm font-medium">Availability</label>
              <Input name="availability" placeholder="e.g., Immediately, 2 weeks notice" />
            </div>
            <div>
              <label className="text-sm font-medium">Upload CSV Resume</label>
              <div className="mt-2">
                {resumeUrl ? (
                  <p className="text-green-600 text-sm">File uploaded successfully!</p>
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !resumeUrl}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
