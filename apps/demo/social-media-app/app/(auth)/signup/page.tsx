"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
    <div className="w-full">
      <div className="text-center mb-8">
        <h1
          className="text-[28px] font-bold text-[#242424] mb-3"
          style={{ fontFamily: '"GT Super", Georgia, serif' }}
        >
          Join Publish.
        </h1>
        <p className="text-[14px] text-[#6B6B6B]">
          Create an account to start reading and writing.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Full name"
            required
            disabled={isLoading}
            className="h-11 border-[#E5E5E5] focus-visible:ring-[#242424] rounded text-[14px]"
          />
        </div>
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
        <div>
          <Input
            id="bio"
            name="bio"
            type="text"
            placeholder="Bio (optional)"
            disabled={isLoading}
            className="h-11 border-[#E5E5E5] focus-visible:ring-[#242424] rounded text-[14px]"
          />
        </div>
        <div>
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="Location (optional)"
            disabled={isLoading}
            className="h-11 border-[#E5E5E5] focus-visible:ring-[#242424] rounded text-[14px]"
          />
        </div>
        <div>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="Website (optional)"
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
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
      <div className="mt-6 text-center text-[13px] text-[#757575]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#1A8917] hover:underline">
          Sign in
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
