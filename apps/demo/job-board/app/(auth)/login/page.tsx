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
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div className="text-sm text-success text-center mb-4">{message}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
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
          {error && (
            <div className="text-sm text-danger text-center">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
        <div className="mt-2 text-center text-sm text-text-muted">
          Want to sign up as an organization?{" "}
          <Link href="/signup/organization" className="text-primary hover:underline">
            Organization signup
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full text-center text-text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
