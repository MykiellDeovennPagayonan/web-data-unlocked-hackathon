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
      role: "INDIVIDUAL" as const,
      bio: (formData.get("bio") as string) || undefined,
      location: (formData.get("location") as string) || undefined,
      website: (formData.get("website") as string) || undefined,
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

      router.push("/login?message=Account created successfully")
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full bg-white border border-border-light rounded-xl p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Create Account</h2>
        <p className="text-sm text-text-secondary mt-1">Sign up as an individual user</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Full name"
            required
            disabled={isLoading}
            className="bg-surface-muted border-border-light focus:border-kaggle-blue h-10"
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
            className="bg-surface-muted border-border-light focus:border-kaggle-blue h-10"
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
            className="bg-surface-muted border-border-light focus:border-kaggle-blue h-10"
          />
        </div>
        <div className="space-y-2">
          <Input
            id="bio"
            name="bio"
            type="text"
            placeholder="Bio (optional)"
            disabled={isLoading}
            className="bg-surface-muted border-border-light focus:border-kaggle-blue h-10"
          />
        </div>
        <div className="space-y-2">
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="Location (optional)"
            disabled={isLoading}
            className="bg-surface-muted border-border-light focus:border-kaggle-blue h-10"
          />
        </div>
        <div className="space-y-2">
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="Website (optional)"
            disabled={isLoading}
            className="bg-surface-muted border-border-light focus:border-kaggle-blue h-10"
          />
        </div>
        <div className="space-y-2">
          <Input
            id="certificateHash"
            name="certificateHash"
            type="text"
            placeholder="TrustLayer Certificate Hash (optional)"
            disabled={isLoading}
            className="bg-surface-muted border-border-light focus:border-kaggle-blue h-10"
          />
          <p className="text-xs text-text-secondary">
            Already verified? Present your TrustLayer Certificate to skip onboarding friction.
          </p>
        </div>
        {error && (
          <div className="text-sm text-destructive text-center">{error}</div>
        )}
        <Button type="submit" className="w-full bg-kaggle-blue hover:bg-kaggle-blue-hover text-white h-10" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-kaggle-blue hover:underline font-medium">
          Sign in
        </Link>
      </div>
      <div className="mt-2 text-center text-sm text-text-muted">
        Want to sign up as an organization?{" "}
        <Link href="/signup/organization" className="text-kaggle-blue hover:underline font-medium">
          Organization signup
        </Link>
      </div>
    </div>
  )
}
