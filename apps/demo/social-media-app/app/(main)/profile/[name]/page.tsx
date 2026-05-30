"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { PostCard } from "@/components/posts/PostCard"
import { Button } from "@/components/ui/button"
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

const tabs = ["Home", "About", "Lists"]

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
  const [activeTab, setActiveTab] = useState("Home")

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
      <div className="min-h-screen bg-[#F7F4ED]">
        <Header />
        <div className="max-w-[1192px] mx-auto px-6 py-8 space-y-4">
          <div className="h-40 bg-[#F2F2F2] animate-pulse rounded" />
          <div className="h-24 bg-[#F2F2F2] animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#F7F4ED]">
        <Header />
        <div className="max-w-[1192px] mx-auto px-6 py-20 text-center text-[#6B6B6B]">
          <p className="text-lg font-medium" style={{ fontFamily: '"GT Super", Georgia, serif' }}>User not found</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = session?.user?.id === profile.id

  return (
    <div className="min-h-screen bg-[#F7F4ED]">
      <Header />
      <main className="max-w-[1192px] mx-auto px-6 py-8">
        {/* Profile header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-6">
              <span className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[40px] md:text-[48px] font-bold text-[#242424]">
                {profile.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <h1
                  className="text-[28px] md:text-[32px] font-bold text-[#242424] mb-2"
                  style={{ fontFamily: '"GT Super", Georgia, serif' }}
                >
                  {profile.name}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-[14px] text-[#6B6B6B]">
                    {profile._count.followers} followers · {profile._count.following} following
                  </p>
                  {profile.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#1A8917] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                      <span>✓</span> TrustLayer Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!isOwnProfile && session && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-5 py-2 text-[13px] rounded-full transition-colors duration-150 self-start ${
                  profile.isFollowing
                    ? "text-[#1A8917] border border-[#1A8917] hover:bg-[#F2F2F2]"
                    : "bg-[#1A8917] text-white hover:bg-[#146d12]"
                }`}
              >
                {profile.isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Bio */}
          {profile.individualProfile?.bio && (
            <p className="text-[16px] text-[#242424] max-w-[600px] mb-3 leading-relaxed">{profile.individualProfile.bio}</p>
          )}
          {profile.organizationProfile?.description && (
            <p className="text-[16px] text-[#242424] max-w-[600px] mb-3 leading-relaxed">{profile.organizationProfile.description}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[#6B6B6B]">
            {profile.individualProfile?.location && (
              <span>{profile.individualProfile.location}</span>
            )}
            {profile.individualProfile?.website && (
              <a href={profile.individualProfile.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#1A8917]">
                {profile.individualProfile.website}
              </a>
            )}
            {profile.organizationProfile?.domain && (
              <a href={`https://${profile.organizationProfile.domain}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#1A8917]">
                {profile.organizationProfile.domain}
              </a>
            )}
            {profile.organizationProfile?.address && (
              <span>{profile.organizationProfile.address}</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-[#E5E5E5]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[14px] transition-colors duration-150 ${
                activeTab === tab
                  ? "text-[#242424] border-b border-[#242424] -mb-[1px]"
                  : "text-[#6B6B6B] hover:text-[#242424]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts */}
        {activeTab === "Home" && (
          <>
            {posts.length === 0 && !postsLoading ? (
              <p className="text-[14px] text-[#757575] text-center py-12">No posts yet.</p>
            ) : (
              <div className="space-y-8">
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
                  <div className="h-24 bg-[#F2F2F2] animate-pulse rounded" />
                )}
                {hasMore && !postsLoading && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const next = page + 1
                        setPage(next)
                        fetchPosts(next, profile.id)
                      }}
                      className="rounded-full px-6 border-[#242424] text-[#242424] hover:bg-[#F2F2F2]"
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "About" && (
          <div className="max-w-[680px]">
            <p className="text-[16px] text-[#6B6B6B]">
              {profile.individualProfile?.bio || profile.organizationProfile?.description || "No bio available."}
            </p>
          </div>
        )}

        {activeTab === "Lists" && (
          <div className="text-center py-12">
            <p className="text-[14px] text-[#757575]">No lists yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}
