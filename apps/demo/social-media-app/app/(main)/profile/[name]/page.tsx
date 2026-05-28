"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { PostCard } from "@/components/posts/PostCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/Header"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  isVerified: boolean
  createdAt: string
  isFollowing: boolean
  _count: { followers: number; following: number; posts: number }
  individualProfile: {
    bio: string | null
    location: string | null
    website: string | null
  } | null
  organizationProfile: {
    domain: string | null
    linkedin: string | null
    description: string | null
    address: string | null
  } | null
}

interface Post {
  id: string
  content: string
  createdAt: string
  isLiked: boolean
  author: { id: string; name: string; role: string; isVerified: boolean }
  _count: { comments: number; likes: number }
}

export default function ProfilePage() {
  const params = useParams()
  const name = decodeURIComponent(params.name as string)
  const { data: session } = useSession()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(name)}`)
      if (res.status === 404) { setNotFound(true); return }
      if (res.ok) setProfile(await res.json())
    } finally {
      setLoading(false)
    }
  }, [name])

  const fetchPosts = useCallback(async (pageNum: number, userId: string, reset = false) => {
    setPostsLoading(true)
    try {
      const res = await fetch(`/api/posts?page=${pageNum}&limit=10&authorId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]))
        setHasMore(pageNum < data.pagination.pages)
      }
    } finally {
      setPostsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile?.id) fetchPosts(1, profile.id, true)
  }, [profile?.id, fetchPosts])

  async function handleFollow() {
    if (!session || !profile) return
    setFollowLoading(true)
    try {
      if (profile.isFollowing) {
        await fetch(`/api/users/follow?followingId=${profile.id}`, { method: "DELETE" })
        setProfile((p) => p ? {
          ...p,
          isFollowing: false,
          _count: { ...p._count, followers: p._count.followers - 1 },
        } : p)
      } else {
        await fetch("/api/users/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: profile.id }),
        })
        setProfile((p) => p ? {
          ...p,
          isFollowing: true,
          _count: { ...p._count, followers: p._count.followers + 1 },
        } : p)
      }
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-24 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">User not found</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = session?.user?.id === profile.id

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile card */}
        <div className="mb-6 p-5 border border-border rounded-lg bg-surface">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
                {profile.isVerified && (
                  <Badge className="text-xs px-1.5 py-0 bg-accent text-white">✓</Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {profile.role === "ORGANIZATION" ? "Organization" : "Individual"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
            {!isOwnProfile && session && (
              <Button
                variant={profile.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
                disabled={followLoading}
              >
                {profile.isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>

          {/* Bio / description */}
          {profile.individualProfile?.bio && (
            <p className="mt-3 text-sm text-foreground">{profile.individualProfile.bio}</p>
          )}
          {profile.organizationProfile?.description && (
            <p className="mt-3 text-sm text-foreground">{profile.organizationProfile.description}</p>
          )}

          {/* Meta info */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {profile.individualProfile?.location && (
              <span>📍 {profile.individualProfile.location}</span>
            )}
            {profile.individualProfile?.website && (
              <a href={profile.individualProfile.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent">
                🔗 {profile.individualProfile.website}
              </a>
            )}
            {profile.organizationProfile?.domain && (
              <a href={`https://${profile.organizationProfile.domain}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent">
                🌐 {profile.organizationProfile.domain}
              </a>
            )}
            {profile.organizationProfile?.address && (
              <span>📍 {profile.organizationProfile.address}</span>
            )}
          </div>

          {/* Stats */}
          <Separator className="my-3" />
          <div className="flex gap-6 text-sm">
            <span><span className="font-semibold text-foreground">{profile._count.posts}</span> <span className="text-muted-foreground">posts</span></span>
            <span><span className="font-semibold text-foreground">{profile._count.followers}</span> <span className="text-muted-foreground">followers</span></span>
            <span><span className="font-semibold text-foreground">{profile._count.following}</span> <span className="text-muted-foreground">following</span></span>
          </div>
        </div>

        {/* Posts */}
        <h2 className="text-base font-semibold text-foreground mb-4">Posts</h2>
        {posts.length === 0 && !postsLoading ? (
          <p className="text-sm text-muted-foreground text-center py-12">No posts yet.</p>
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
            {postsLoading && (
              <div className="h-24 rounded-lg bg-muted animate-pulse" />
            )}
            {hasMore && !postsLoading && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const next = page + 1
                  setPage(next)
                  fetchPosts(next, profile.id)
                }}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
