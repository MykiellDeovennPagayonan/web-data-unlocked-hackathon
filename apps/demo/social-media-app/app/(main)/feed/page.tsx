"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { PostCard } from "@/components/posts/PostCard"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"

interface Post {
  id: string
  content: string
  createdAt: string
  isLiked: boolean
  author: {
    id: string
    name: string
    role: string
    isVerified: boolean
  }
  _count: {
    comments: number
    likes: number
  }
}

export default function FeedPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const fetchPosts = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/feed?page=${pageNum}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]))
        setHasMore(pageNum < data.pagination.pages)
      }
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(1, true)
  }, [fetchPosts])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchPosts(next)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Feed</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {session
                ? "Posts from people you follow"
                : "All recent posts — sign in to see your personalized feed"}
            </p>
          </div>
          {session && (
            <Button asChild size="sm">
              <Link href="/post/create">New Post</Link>
            </Button>
          )}
        </div>

        {/* Posts */}
        {initialLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm mt-1">
              {session
                ? "Follow some users or create the first post!"
                : "Be the first to post — sign up now."}
            </p>
            {!session && (
              <Button asChild className="mt-4">
                <Link href="/signup">Sign Up</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                content={post.content}
                author={post.author}
                createdAt={post.createdAt}
                commentCount={post._count.comments}
                likeCount={post._count.likes}
                isLiked={post.isLiked}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
