"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewJobPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading" || !session || session.user.role !== "ORGANIZATION") {
    return <div className="container mx-auto py-8 px-4">Loading...</div>
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          location: formData.get("location"),
          salaryMin: formData.get("salaryMin"),
          salaryMax: formData.get("salaryMax"),
          jobType: formData.get("jobType"),
          requirements: formData.get("requirements")
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create job")
      }

      router.push("/dashboard/jobs")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface">
      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-8">
        <Link href="/dashboard/jobs" className="inline-flex items-center text-text-secondary hover:text-text-primary text-sm mb-6 font-medium">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Jobs
        </Link>
        <div className="bg-white border border-border-strong rounded-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Post a New Job</h1>
          <p className="text-sm text-text-secondary mb-6">Fill in the details to publish your job opening</p>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <Label className="text-sm font-medium text-text-primary">Job Title *</Label>
              <Input name="title" required className="h-11 mt-1 border-border-strong focus-visible:ring-glassdoor-green" />
            </div>
            <div>
              <Label className="text-sm font-medium text-text-primary">Description *</Label>
              <Textarea name="description" rows={4} required className="mt-1 border-border-strong focus-visible:ring-glassdoor-green" />
            </div>
            <div>
              <Label className="text-sm font-medium text-text-primary">Location</Label>
              <Input name="location" placeholder="e.g., New York, Remote" className="h-11 mt-1 border-border-strong focus-visible:ring-glassdoor-green" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-text-primary">Min Salary</Label>
                <Input name="salaryMin" type="number" className="h-11 mt-1 border-border-strong focus-visible:ring-glassdoor-green" />
              </div>
              <div>
                <Label className="text-sm font-medium text-text-primary">Max Salary</Label>
                <Input name="salaryMax" type="number" className="h-11 mt-1 border-border-strong focus-visible:ring-glassdoor-green" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-text-primary">Job Type</Label>
              <Select name="jobType" defaultValue="FULL_TIME">
                <SelectTrigger className="h-11 mt-1 border-border-strong focus:ring-glassdoor-green"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full-time</SelectItem>
                  <SelectItem value="PART_TIME">Part-time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-text-primary">Requirements</Label>
              <Textarea name="requirements" rows={3} placeholder="List required skills, experience, etc." className="mt-1 border-border-strong focus-visible:ring-glassdoor-green" />
            </div>
            {error && <p className="text-danger text-sm font-medium">{error}</p>}
            <Button
              type="submit"
              className="w-full h-11 bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold rounded"
              disabled={loading}
            >
              {loading ? "Creating..." : "Post Job"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
