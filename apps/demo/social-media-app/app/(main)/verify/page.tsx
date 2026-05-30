"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"

export default function VerifyPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [certificateHash, setCertificateHash] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/verify")
        if (res.ok) {
          const data = await res.json()
          setIsVerified(data.isVerified)
        }
      } catch {
        // ignore
      }
    }
    if (status === "authenticated") {
      checkStatus()
    }
  }, [status])

  async function handleVerify() {
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/verify", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Verification failed")
        return
      }
      setIsVerified(true)
      setCertificateHash(data.certificateHash)
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F4ED]">
        <Header />
        <div className="max-w-[680px] mx-auto px-6 py-12 text-center">
          <p className="text-[#6B6B6B]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F4ED]">
      <Header />
      <main className="max-w-[680px] mx-auto px-6 py-12">
        <h1
          className="text-[28px] font-bold text-[#242424] mb-4"
          style={{ fontFamily: '"GT Super", Georgia, serif' }}
        >
          Identity Verification
        </h1>
        <p className="text-[16px] text-[#6B6B6B] mb-8 leading-relaxed">
          Verify your identity with TrustLayer to receive a portable Trust Certificate.
          Once verified, you can use this certificate on any partner platform without repeating KYC.
        </p>

        {isVerified ? (
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1A8917] text-white text-sm font-bold">
                ✓
              </span>
              <h2 className="text-[18px] font-bold text-[#242424]">You are TrustLayer Verified</h2>
            </div>
            {certificateHash && (
              <div className="space-y-2">
                <p className="text-[14px] text-[#6B6B6B]">Your Trust Certificate hash:</p>
                <code className="block bg-[#F2F2F2] rounded p-3 text-[13px] font-mono text-[#242424] break-all">
                  {certificateHash}
                </code>
                <p className="text-[13px] text-[#757575]">
                  Copy this hash and paste it when signing up on partner platforms to skip KYC.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
            <p className="text-[14px] text-[#6B6B6B] mb-4">
              Click the button below to start your identity verification. This demo will auto-approve your request and issue a certificate.
            </p>
            {error && (
              <div className="text-[13px] text-[#CC0000] mb-4">{error}</div>
            )}
            <Button
              onClick={handleVerify}
              disabled={isLoading}
              className="rounded-full bg-[#191919] hover:bg-black text-white text-[14px] font-medium px-6 h-11"
            >
              {isLoading ? "Verifying..." : "Start Identity Verification"}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
