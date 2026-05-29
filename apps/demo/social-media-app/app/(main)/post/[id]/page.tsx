"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface Author {
  id: string
  name: string
  role: string
  isVerified: boolean
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: Author
}

interface Post {
  id: string
  content: string
  createdAt: string
  author: Author
  isLiked?: boolean
  _count: { comments: number; likes: number }
  comments: Comment[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const id = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchPost = useCallback(async () => {
    const res = await fetch(`/api/posts/${id}`)
    if (res.status === 404) { setNotFound(true); return }
    if (res.ok) {
      const data = await res.json()
      setPost(data)
      setComments(data.comments ?? [])
      setLikes(data._count.likes)
      // Check if current user liked — fetch from feed endpoint isn't available here,
      // so we default to false and let optimistic UI handle it
      setLiked(false)
    }
  }, [id])

  useEffect(() => { fetchPost() }, [fetchPost])

  async function handleLike() {
    if (!session) return
    setIsLiking(true)
    try {
      const res = await fetch(`/api/posts/${id}/like`, { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setLikes((prev) => (data.liked ? prev + 1 : prev - 1))
      }
    } finally {
      setIsLiking(false)
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !session) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setComments((prev) => [...prev, newComment])
        setCommentText("")
        textareaRef.current?.focus()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">Post not found</p>
          <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="h-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-24 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        {/* Post */}
        <Card className="border border-border shadow-none mb-6">
          <CardContent className="pt-5 pb-4">
            {/* Author */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${encodeURIComponent(post.author.name)}`}
                  className="font-semibold text-sm text-foreground hover:underline"
                >
                  {post.author.name}
                </Link>
                {post.author.isVerified && (
                  <Badge className="text-xs px-1.5 py-0 bg-accent text-white">✓</Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {post.author.role === "ORGANIZATION" ? "Org" : "Individual"}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
            </div>

            {/* Content */}
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed mb-4">
              {post.content}
            </p>

            <Separator className="mb-3" />

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking || !session}
                className={`text-xs gap-1.5 ${liked ? "text-foreground" : "text-muted-foreground"}`}
              >
                <span>{liked ? "♥" : "♡"}</span>
                <span>{likes} {likes === 1 ? "like" : "likes"}</span>
              </Button>
              <span className="text-xs text-muted-foreground self-center">
                💬 {comments.length} {comments.length === 1 ? "comment" : "comments"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Comments section */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Comments</h2>

          {/* Comment input */}
          {session ? (
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                placeholder="Write a comment… (Enter to submit, Shift+Enter for new line)"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                className="resize-none text-sm"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment(e as unknown as React.FormEvent)
                  }
                }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !commentText.trim()}
                className="shrink-0"
              >
                {isSubmitting ? "…" : "Post"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="underline">Sign in</Link> to leave a comment.
            </p>
          )}

          {/* Comment list */}
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/profile/${encodeURIComponent(c.author.name)}`}
                        className="text-xs font-semibold text-foreground hover:underline"
                      >
                        {c.author.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
