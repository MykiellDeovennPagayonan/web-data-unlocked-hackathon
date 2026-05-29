"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Bookmark } from "lucide-react"

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
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) return "Just now"
    return `${diffHours}h ago`
  }
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

function deriveTitle(content: string) {
  const lines = content.split(/\n+/).filter(Boolean)
  const firstLine = lines[0] || "Untitled"
  return firstLine.slice(0, 80) + (firstLine.length > 80 ? "…" : "")
}

function deriveExcerpt(content: string) {
  const lines = content.split(/\n+/).filter(Boolean)
  const rest = lines.slice(1).join(" ")
  const excerpt = rest.slice(0, 160)
  return excerpt + (rest.length > 160 ? "…" : "")
}

const topicTags = ["Writing", "Technology", "Life", "Productivity", "Design"]

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
  const [bookmarked, setBookmarked] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const title = deriveTitle(content)
  const excerpt = deriveExcerpt(content)
  const readTime = estimateReadTime(content)
  const tag = topicTags[id.charCodeAt(0) % topicTags.length]

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
    <article className="pb-6 border-b border-[#E5E5E5]">
      <div className="flex gap-6 items-start">
        {/* Text content */}
        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/profile/${encodeURIComponent(author.name)}`}
              className="flex items-center gap-2 group"
            >
              <span className="w-5 h-5 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[11px] font-semibold text-[#242424]">
                {author.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-[13px] text-[#242424] group-hover:underline">
                {author.name}
              </span>
            </Link>
            {author.isVerified && (
              <span className="text-[11px] text-[#1A8917] font-medium">✓</span>
            )}
          </div>

          {/* Title */}
          <Link href={`/post/${id}`} className="block group">
            <h2
              className="text-[20px] md:text-[22px] font-bold leading-snug mb-2 group-hover:underline"
              style={{ fontFamily: '"GT Super", Georgia, serif' }}
            >
              {title}
            </h2>
          </Link>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-[16px] text-[#6B6B6B] leading-relaxed mb-3 line-clamp-2">
              {excerpt}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] text-[#6B6B6B]">
              <span>{formatDate(createdAt)}</span>
              <span>·</span>
              <span>{readTime}</span>
              <span className="px-2 py-0.5 bg-[#F2F2F2] rounded text-[12px] text-[#242424]">
                {tag}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                disabled={isLiking || !session}
                className={`flex items-center gap-1 transition-colors duration-150 ${
                  liked ? "text-[#CC0000]" : "text-[#6B6B6B] hover:text-[#242424]"
                }`}
                aria-label={liked ? "Unlike" : "Like"}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{likes}</span>
              </button>
              <button
                onClick={handleToggleComments}
                className={`flex items-center gap-1 transition-colors duration-150 ${
                  showComments ? "text-[#242424]" : "text-[#6B6B6B] hover:text-[#242424]"
                }`}
                aria-label="Comments"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{totalComments}</span>
              </button>
              <button
                onClick={() => setBookmarked((b) => !b)}
                className={`transition-colors duration-150 ${
                  bookmarked ? "text-[#242424]" : "text-[#6B6B6B] hover:text-[#242424]"
                }`}
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail (desktop only) */}
        <Link
          href={`/post/${id}`}
          className="hidden md:block shrink-0 w-[200px] h-[134px] bg-[#F2F2F2] rounded overflow-hidden"
        >
          <div className="w-full h-full flex items-center justify-center text-[#9F9E9B]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Inline comment section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#F2F2F2] space-y-3">
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Link
                    href={`/profile/${encodeURIComponent(c.author.name)}`}
                    className="text-[13px] font-semibold text-[#242424] hover:underline shrink-0"
                  >
                    {c.author.name}
                  </Link>
                  <p className="text-[13px] text-[#242424] leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {commentsLoaded && comments.length === 0 && (
            <p className="text-[13px] text-[#757575]">No comments yet.</p>
          )}

          {session ? (
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                placeholder="Write a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={1}
                className="resize-none text-[13px] min-h-[36px] py-2 border-[#E5E5E5] focus-visible:ring-[#242424]"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment(e as unknown as React.FormEvent)
                  }
                }}
              />
              <Button type="submit" size="sm" disabled={isSubmitting || !commentText.trim()} className="shrink-0 rounded-full text-[13px]">
                {isSubmitting ? "…" : "Post"}
              </Button>
            </form>
          ) : (
            <p className="text-[13px] text-[#757575]">
              <Link href="/login" className="underline text-[#1A8917]">Sign in</Link> to comment.
            </p>
          )}
        </div>
      )}
    </article>
  )
}
