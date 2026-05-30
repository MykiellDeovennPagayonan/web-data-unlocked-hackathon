"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

      router.push("/")
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full bg-white border border-border-light rounded-xl p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Sign In</h2>
        <p className="text-sm text-text-secondary mt-1">Enter your credentials to access your account</p>
      </div>
      {message && (
        <div className="text-sm text-green-600 text-center mb-4">{message}</div>
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
        {error && (
          <div className="text-sm text-destructive text-center">{error}</div>
        )}
        <Button type="submit" className="w-full bg-kaggle-blue hover:bg-kaggle-blue-hover text-white h-10" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-kaggle-blue hover:underline font-medium">
          Sign up
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full text-center text-text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
