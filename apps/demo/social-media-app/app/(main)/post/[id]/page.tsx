"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Bookmark, Share } from "lucide-react"

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

function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

function deriveTitle(content: string) {
  const lines = content.split(/\n+/).filter(Boolean)
  const firstLine = lines[0] || "Untitled"
  return firstLine
}

function deriveBody(content: string) {
  const lines = content.split(/\n+/).filter(Boolean)
  return lines.slice(1).join("\n\n") || content
}

export default function PostDetailPage() {
  const params = useParams()
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
  const [bookmarked, setBookmarked] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchPost = useCallback(async () => {
    const res = await fetch(`/api/posts/${id}`)
    if (res.status === 404) { setNotFound(true); return }
    if (res.ok) {
      const data = await res.json()
      setPost(data)
      setComments(data.comments ?? [])
      setLikes(data._count.likes)
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
      <div className="min-h-screen bg-[#F7F4ED]">
        <Header />
        <div className="max-w-[680px] mx-auto px-6 py-20 text-center text-[#6B6B6B]">
          <p className="text-lg font-medium" style={{ fontFamily: '"GT Super", Georgia, serif' }}>Post not found</p>
          <Button variant="ghost" className="mt-4" onClick={() => window.history.back()}>Go back</Button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F7F4ED]">
        <Header />
        <div className="max-w-[680px] mx-auto px-6 pt-20 space-y-4">
          <div className="h-8 w-3/4 bg-[#F2F2F2] animate-pulse rounded" />
          <div className="h-6 w-1/2 bg-[#F2F2F2] animate-pulse rounded" />
          <div className="h-40 bg-[#F2F2F2] animate-pulse rounded" />
        </div>
      </div>
    )
  }

  const title = deriveTitle(post.content)
  const body = deriveBody(post.content)
  const readTime = estimateReadTime(post.content)

  return (
    <div className="min-h-screen bg-[#F7F4ED]">
      <Header />
      <main className="pt-12 pb-20">
        {/* Title area — max 900px */}
        <div className="max-w-[900px] mx-auto px-6 mb-10">
          {/* Title */}
          <h1
            className="text-[32px] md:text-[42px] font-bold leading-[1.15] tracking-[-0.02em] mb-8"
            style={{ fontFamily: '"GT Super", Georgia, serif' }}
          >
            {title}
          </h1>

          {/* Author bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${encodeURIComponent(post.author.name)}`}>
                <span className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[14px] font-semibold text-[#242424]">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${encodeURIComponent(post.author.name)}`}
                    className="text-[14px] font-semibold text-[#242424] hover:underline"
                  >
                    {post.author.name}
                  </Link>
                  {post.author.isVerified && (
                    <span className="text-[11px] text-[#1A8917] font-medium">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#6B6B6B]">
                  <span>{readTime}</span>
                  <span>·</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
            {session && session.user?.name !== post.author.name && (
              <button className="px-4 py-1.5 text-[13px] text-[#1A8917] border border-[#1A8917] rounded-full hover:bg-[#F2F2F2] transition-colors duration-150">
                Follow
              </button>
            )}
          </div>
        </div>

        {/* Body — max 680px for optimal reading */}
        <div className="max-w-[680px] mx-auto px-6">
          <article className="text-[20px] leading-[1.6] text-[#242424] mb-12">
            {body.split(/\n\n+/).filter(Boolean).map((paragraph, i) => (
              <p key={i} className="mb-[1.5em]">
                {paragraph}
              </p>
            ))}
          </article>

          {/* Actions bar */}
          <div className="flex items-center justify-between py-6 border-t border-b border-[#E5E5E5] mb-12">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                disabled={isLiking || !session}
                className={`flex items-center gap-2 transition-colors duration-150 ${
                  liked ? "text-[#CC0000]" : "text-[#6B6B6B] hover:text-[#242424]"
                }`}
                aria-label={liked ? "Unlike" : "Like"}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                <span className="text-[14px]">{likes}</span>
              </button>
              <div className="flex items-center gap-2 text-[#6B6B6B]">
                <MessageCircle className="w-5 h-5" />
                <span className="text-[14px]">{comments.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setBookmarked((b) => !b)}
                className={`transition-colors duration-150 ${
                  bookmarked ? "text-[#242424]" : "text-[#6B6B6B] hover:text-[#242424]"
                }`}
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
              </button>
              <button className="text-[#6B6B6B] hover:text-[#242424] transition-colors duration-150" aria-label="Share">
                <Share className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Author bio */}
          <div className="flex items-start gap-4 py-8 border-b border-[#E5E5E5] mb-12">
            <Link href={`/profile/${encodeURIComponent(post.author.name)}`}>
              <span className="w-14 h-14 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[20px] font-semibold text-[#242424]">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            </Link>
            <div className="flex-1">
              <p className="text-[16px] font-semibold text-[#242424] mb-1">{post.author.name}</p>
              <p className="text-[14px] text-[#6B6B6B] mb-3">Writer on Publish</p>
              {session && session.user?.name !== post.author.name && (
                <button className="px-4 py-1.5 text-[13px] text-[#1A8917] border border-[#1A8917] rounded-full hover:bg-[#F2F2F2] transition-colors duration-150">
                  Follow
                </button>
              )}
            </div>
          </div>

          {/* Comments section */}
          <div className="space-y-6">
            <h2 className="text-[20px] font-bold text-[#242424]" style={{ fontFamily: '"GT Super", Georgia, serif' }}>
              Comments
            </h2>

            {session ? (
              <form onSubmit={handleSubmitComment} className="flex gap-3 items-end">
                <Textarea
                  ref={textareaRef}
                  placeholder="What are your thoughts?"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  className="resize-none text-[16px] border-[#E5E5E5] focus-visible:ring-[#242424]"
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
                  className="shrink-0 rounded-full text-[13px] bg-[#1A8917] hover:bg-[#146d12]"
                >
                  {isSubmitting ? "…" : "Respond"}
                </Button>
              </form>
            ) : (
              <p className="text-[14px] text-[#6B6B6B]">
                <Link href="/login" className="underline text-[#1A8917]">Sign in</Link> to leave a comment.
              </p>
            )}

            {comments.length === 0 ? (
              <p className="text-[14px] text-[#757575] py-4 text-center">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-6">
                {comments.map((c) => (
                  <div key={c.id} className="py-4 border-b border-[#F2F2F2] last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/profile/${encodeURIComponent(c.author.name)}`}
                        className="text-[14px] font-semibold text-[#242424] hover:underline"
                      >
                        {c.author.name}
                      </Link>
                      <span className="text-[13px] text-[#6B6B6B]">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-[16px] text-[#242424] leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
