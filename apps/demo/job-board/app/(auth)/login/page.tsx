"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const message = searchParams.get("message")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      const session = await getSession()
      if (session?.user?.role === "ORGANIZATION") {
        router.push("/dashboard/jobs")
      } else {
        router.push("/jobs")
      }
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-border-strong rounded-lg shadow-sm p-6 md:p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Sign In</h1>
        <p className="text-sm text-text-secondary mt-1">
          Enter your credentials to access your account
        </p>
      </div>
      <div>
        {message && (
          <div className="text-sm text-glassdoor-green text-center mb-4 font-medium">{message}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
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
            <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
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
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-5 pt-5 border-t border-surface-alt space-y-2 text-center">
          <p className="text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-glassdoor-green font-semibold hover:underline">
              Sign up
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full text-center text-text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
