"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/layout/Header"

const MAX_CHARS = 2000

function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

export default function CreatePostPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F4ED]">
        <Header />
        <div className="max-w-[740px] mx-auto px-6 pt-20">
          <div className="h-12 bg-[#F2F2F2] animate-pulse rounded mb-4" />
          <div className="h-64 bg-[#F2F2F2] animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F7F4ED]">
        <Header />
        <div className="max-w-[740px] mx-auto px-6 py-20 text-center">
          <p className="text-[#6B6B6B] mb-4">You must be signed in to write a story.</p>
          <Button asChild className="rounded-full bg-[#FFC017] text-[#242424] hover:bg-[#E5AC00] border-none">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setIsSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || "Something went wrong")
        return
      }
      router.push("/feed")
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const remaining = MAX_CHARS - content.length
  const readTime = estimateReadTime(content)

  return (
    <div className="min-h-screen bg-[#F7F4ED]">
      <Header />
      <main className="max-w-[740px] mx-auto px-6 pt-10 pb-20">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-[13px] text-[#6B6B6B]">
            Draft in <span className="text-[#242424] font-medium">{session.user.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#6B6B6B]">{readTime}</span>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || content.trim().length === 0}
              className="rounded-full px-6 h-9 text-[13px] bg-[#1A8917] hover:bg-[#146d12] text-white"
            >
              {isSubmitting ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            placeholder="Tell your story..."
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            rows={12}
            className="resize-none text-[20px] leading-[1.6] border-none shadow-none focus-visible:ring-0 bg-transparent p-0 placeholder:text-[#757575]"
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
            <span className={`text-[13px] ${remaining < 100 ? "text-[#CC0000]" : "text-[#6B6B6B]"}`}>
              {remaining} characters remaining
            </span>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="text-[13px] rounded-full"
              >
                Cancel
              </Button>
            </div>
          </div>
          {error && <p className="text-[14px] text-[#CC0000]">{error}</p>}
        </form>
      </main>
    </div>
  )
}
