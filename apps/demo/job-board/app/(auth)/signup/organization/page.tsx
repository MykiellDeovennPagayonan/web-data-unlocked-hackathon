"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrganizationSignup() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)

    let deviceFingerprint: Array<{ signalType: string; value: string }> = []
    try {
      const FingerprintJS = await import("@fingerprintjs/fingerprintjs")
      const fp = await FingerprintJS.load()
      const result = await fp.get()
      deviceFingerprint = [
        { signalType: "canvas_hash", value: result.visitorId },
        { signalType: "user_agent", value: navigator.userAgent },
        { signalType: "language", value: navigator.language },
        { signalType: "screen_resolution", value: `${screen.width}x${screen.height}` },
        { signalType: "timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
      ]
    } catch {
      // Non-fatal — proceed without fingerprint
    }

    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      role: "ORGANIZATION" as const,
      domain: (formData.get("domain") as string) || undefined,
      linkedin: (formData.get("linkedin") as string) || undefined,
      regNumber: (formData.get("regNumber") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      certificateHash: (formData.get("certificateHash") as string) || undefined,
      deviceFingerprint,
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        setError(error.message || "Something went wrong")
        return
      }

      router.push("/login?message=Organization account created successfully")
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-border-strong rounded-lg shadow-sm p-6 md:p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Create Organization Account</h1>
        <p className="text-sm text-text-secondary mt-1">Sign up as an organization to post jobs</p>
      </div>
      <div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Organization Name *</label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Acme Inc."
              required
              disabled={isLoading}
              className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contact@company.com"
              required
              disabled={isLoading}
              className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Password *</label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              required
              disabled={isLoading}
              className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Website Domain (optional)</label>
            <Input
              id="domain"
              name="domain"
              type="text"
              placeholder="company.com"
              disabled={isLoading}
              className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">LinkedIn Profile (optional)</label>
            <Input
              id="linkedin"
              name="linkedin"
              type="text"
              placeholder="linkedin.com/company/..."
              disabled={isLoading}
              className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Registration Number (optional)</label>
            <Input
              id="regNumber"
              name="regNumber"
              type="text"
              placeholder="Business registration number"
              disabled={isLoading}
              className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Address (optional)</label>
            <Textarea
              id="address"
              name="address"
              placeholder="Company address"
              disabled={isLoading}
              className="border-border-strong focus-visible:ring-glassdoor-green min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description (optional)</label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell us about your organization"
              disabled={isLoading}
              className="border-border-strong focus-visible:ring-glassdoor-green min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">TrustLayer Certificate Hash (optional)</label>
            <Input
              id="certificateHash"
              name="certificateHash"
              type="text"
              placeholder="Paste your TrustLayer certificate hash"
              disabled={isLoading}
              className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
            />
            <p className="text-xs text-text-secondary mt-1">
              Presenting a valid certificate will skip manual vetting.
            </p>
          </div>
          {error && (
            <div className="text-sm text-danger text-center font-medium">{error}</div>
          )}
          <Button
            type="submit"
            className="w-full h-11 bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold rounded"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up as Organization"}
          </Button>
        </form>
        <div className="mt-5 pt-5 border-t border-surface-alt space-y-2 text-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-glassdoor-green font-semibold hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-sm text-text-secondary">
            Want to sign up as an individual?{" "}
            <Link href="/signup" className="text-glassdoor-green font-semibold hover:underline">
              Individual signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
