"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/Header"

const MAX_CHARS = 1000

export default function CreatePostPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="h-48 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">You must be signed in to create a post.</p>
          <Button asChild>
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Create Post</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Share something with the community</p>
        </div>

        <Card className="border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Posting as <span className="font-semibold text-foreground">{session.user.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                rows={6}
                className="resize-none text-sm border-border focus-visible:ring-accent"
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${remaining < 50 ? "text-danger" : "text-muted-foreground"}`}>
                  {remaining} characters remaining
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || content.trim().length === 0}
                  >
                    {isSubmitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
