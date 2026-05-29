"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function IndividualSignup() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      role: "INDIVIDUAL" as const,
      bio: (formData.get("bio") as string) || undefined,
      location: (formData.get("location") as string) || undefined,
      website: (formData.get("website") as string) || undefined,
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

      router.push("/login?message=Account created successfully")
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-border-strong rounded-lg shadow-sm p-6 md:p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
        <p className="text-sm text-text-secondary mt-1">Sign up as an individual job seeker</p>
      </div>
      <div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Full Name *</label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
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
              placeholder="you@example.com"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Bio (optional)</label>
            <Input
              id="bio"
              name="bio"
              type="text"
              placeholder="Tell us about yourself"
              disabled={isLoading}
              className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Location (optional)</label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="e.g., San Francisco, CA"
              disabled={isLoading}
              className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Website (optional)</label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://yourwebsite.com"
              disabled={isLoading}
              className="h-11 border-border-strong focus-visible:ring-glassdoor-green"
            />
          </div>
          {error && (
            <div className="text-sm text-danger text-center font-medium">{error}</div>
          )}
          <Button
            type="submit"
            className="w-full h-11 bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold rounded"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
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
            Want to sign up as an organization?{" "}
            <Link href="/signup/organization" className="text-glassdoor-green font-semibold hover:underline">
              Organization signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
