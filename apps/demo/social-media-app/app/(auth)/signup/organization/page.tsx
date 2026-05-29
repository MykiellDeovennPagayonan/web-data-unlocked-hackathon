"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
    <div className="w-full">
      <div className="text-center mb-8">
        <h1
          className="text-[28px] font-bold text-[#242424] mb-3"
          style={{ fontFamily: '"GT Super", Georgia, serif' }}
        >
          Register your organization.
        </h1>
        <p className="text-[14px] text-[#6B6B6B]">
          Create an organization account with KYC information.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Organization name"
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
            id="domain"
            name="domain"
            type="text"
            placeholder="Website domain (optional)"
            disabled={isLoading}
            className="h-11 border-[#E5E5E5] focus-visible:ring-[#242424] rounded text-[14px]"
          />
        </div>
        <div>
          <Input
            id="linkedin"
            name="linkedin"
            type="text"
            placeholder="LinkedIn profile (optional)"
            disabled={isLoading}
            className="h-11 border-[#E5E5E5] focus-visible:ring-[#242424] rounded text-[14px]"
          />
        </div>
        <div>
          <Input
            id="regNumber"
            name="regNumber"
            type="text"
            placeholder="Registration number (optional)"
            disabled={isLoading}
            className="h-11 border-[#E5E5E5] focus-visible:ring-[#242424] rounded text-[14px]"
          />
        </div>
        <div>
          <Textarea
            id="address"
            name="address"
            placeholder="Address (optional)"
            disabled={isLoading}
            className="border-[#E5E5E5] focus-visible:ring-[#242424] rounded text-[14px]"
          />
        </div>
        <div>
          <Textarea
            id="description"
            name="description"
            placeholder="Organization description (optional)"
            disabled={isLoading}
            className="border-[#E5E5E5] focus-visible:ring-[#242424] rounded text-[14px]"
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
          {isLoading ? "Creating account..." : "Sign Up as Organization"}
        </Button>
      </form>
      <div className="mt-6 text-center text-[13px] text-[#757575]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#1A8917] hover:underline">
          Sign in
        </Link>
      </div>
      <div className="mt-2 text-center text-[13px] text-[#757575]">
        Want to sign up as an individual?{" "}
        <Link href="/signup" className="text-[#1A8917] hover:underline">
          Individual signup
        </Link>
      </div>
    </div>
  )
}
