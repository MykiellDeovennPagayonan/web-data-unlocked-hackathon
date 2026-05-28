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
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create Organization Account</CardTitle>
        <CardDescription className="text-center">
          Sign up as an organization with KYC information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Organization name"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="domain"
              name="domain"
              type="text"
              placeholder="Website domain (optional)"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="linkedin"
              name="linkedin"
              type="text"
              placeholder="LinkedIn profile (optional)"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="regNumber"
              name="regNumber"
              type="text"
              placeholder="Registration number (optional)"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              id="address"
              name="address"
              placeholder="Address (optional)"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              id="description"
              name="description"
              placeholder="Organization description (optional)"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="text-sm text-danger text-center">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up as Organization"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
        <div className="mt-2 text-center text-sm text-text-muted">
          Want to sign up as an individual?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Individual signup
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
