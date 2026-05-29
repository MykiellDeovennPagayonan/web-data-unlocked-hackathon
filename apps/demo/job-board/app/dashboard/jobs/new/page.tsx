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
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link href="/dashboard/jobs" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Jobs
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Job Title *</Label>
              <Input name="title" required />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea name="description" rows={4} required />
            </div>
            <div>
              <Label>Location</Label>
              <Input name="location" placeholder="e.g., New York, Remote" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Salary</Label>
                <Input name="salaryMin" type="number" />
              </div>
              <div>
                <Label>Max Salary</Label>
                <Input name="salaryMax" type="number" />
              </div>
            </div>
            <div>
              <Label>Job Type</Label>
              <Select name="jobType" defaultValue="FULL_TIME">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full-time</SelectItem>
                  <SelectItem value="PART_TIME">Part-time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Requirements</Label>
              <Textarea name="requirements" rows={3} placeholder="List required skills, experience, etc." />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
