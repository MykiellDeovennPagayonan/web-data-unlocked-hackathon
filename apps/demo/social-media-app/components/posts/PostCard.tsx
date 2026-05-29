"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

interface PostAuthor {
  id: string
  name: string
  role: string
  isVerified: boolean
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: PostAuthor
}

interface PostCardProps {
  id: string
  content: string
  author: PostAuthor
  createdAt: string
  commentCount: number
  likeCount: number
  isLiked: boolean
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function PostCard({
  id,
  content,
  author,
  createdAt,
  commentCount,
  likeCount,
  isLiked: initialIsLiked,
}: PostCardProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(initialIsLiked)
  const [likes, setLikes] = useState(likeCount)
  const [isLiking, setIsLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalComments, setTotalComments] = useState(commentCount)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function loadComments() {
    if (commentsLoaded) return
    const res = await fetch(`/api/posts/${id}/comments?limit=50`)
    if (res.ok) {
      const data = await res.json()
      setComments(data.comments)
      setCommentsLoaded(true)
    }
  }

  async function handleToggleComments() {
    const next = !showComments
    setShowComments(next)
    if (next) await loadComments()
  }

  useEffect(() => {
    if (showComments) textareaRef.current?.focus()
  }, [showComments])

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
        setTotalComments((prev) => prev + 1)
        setCommentText("")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border border-border rounded-lg bg-surface shadow-none hover:shadow-sm transition-shadow">
      <CardContent className="pt-5 pb-3">
        {/* Author row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${encodeURIComponent(author.name)}`}
              className="font-semibold text-sm text-foreground hover:underline"
            >
              {author.name}
            </Link>
            {author.isVerified && (
              <Badge className="text-xs px-1.5 py-0 bg-accent text-white">✓</Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {author.role === "ORGANIZATION" ? "Org" : "Individual"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{formatDate(createdAt)}</span>
            <Link href={`/post/${id}`} className="text-xs text-muted-foreground hover:underline">
              View
            </Link>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </CardContent>

      <Separator />

      <CardFooter className="py-2 px-5 flex gap-4">
        {/* Like button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking || !session}
          className={`text-xs gap-1.5 ${liked ? "text-foreground" : "text-muted-foreground"}`}
        >
          <span>{liked ? "♥" : "♡"}</span>
          <span>{likes}</span>
        </Button>

        {/* Comment toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleComments}
          className={`text-xs gap-1.5 ${showComments ? "text-foreground" : "text-muted-foreground"}`}
        >
          <span>💬</span>
          <span>{totalComments}</span>
        </Button>
      </CardFooter>

      {/* Inline comment section */}
      {showComments && (
        <div className="px-5 pb-4 space-y-3">
          <Separator className="mb-3" />

          {/* Existing comments */}
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Link
                    href={`/profile/${encodeURIComponent(c.author.name)}`}
                    className="text-xs font-semibold text-foreground hover:underline shrink-0"
                  >
                    {c.author.name}
                  </Link>
                  <p className="text-xs text-foreground leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {commentsLoaded && comments.length === 0 && (
            <p className="text-xs text-muted-foreground">No comments yet.</p>
          )}

          {/* Comment input */}
          {session ? (
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                placeholder="Write a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={1}
                className="resize-none text-xs min-h-[36px] py-2"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment(e as unknown as React.FormEvent)
                  }
                }}
              />
              <Button type="submit" size="sm" disabled={isSubmitting || !commentText.trim()} className="shrink-0">
                {isSubmitting ? "…" : "Post"}
              </Button>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">
              <Link href="/login" className="underline">Sign in</Link> to comment.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
