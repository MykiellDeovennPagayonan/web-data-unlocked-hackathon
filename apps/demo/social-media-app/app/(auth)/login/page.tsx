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

      router.push("/feed")
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1
          className="text-[28px] font-bold text-[#242424] mb-3"
          style={{ fontFamily: '"GT Super", Georgia, serif' }}
        >
          Welcome back.
        </h1>
        <p className="text-[14px] text-[#6B6B6B]">
          Sign in to access your personalized feed.
        </p>
      </div>

      {message && (
        <div className="text-[13px] text-[#1A8917] text-center mb-4">{message}</div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            required
            disabled={isLoading}
            className="h-11 border-[#E5E5E5] focus-visible:ring-[#242424] rounded text-[14px]"
          />
        </div>
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            required
            disabled={isLoading}
            className="h-11 border-[#E5E5E5] focus-visible:ring-[#242424] rounded text-[14px]"
          />
        </div>
        {error && (
          <div className="text-[13px] text-[#CC0000] text-center">{error}</div>
        )}
        <Button
          type="submit"
          className="w-full h-11 rounded-full bg-[#191919] hover:bg-black text-white text-[14px] font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <div className="mt-6 text-center text-[13px] text-[#757575]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#1A8917] hover:underline">
          Sign up
        </Link>
      </div>
      <div className="mt-2 text-center text-[13px] text-[#757575]">
        Want to sign up as an organization?{" "}
        <Link href="/signup/organization" className="text-[#1A8917] hover:underline">
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
