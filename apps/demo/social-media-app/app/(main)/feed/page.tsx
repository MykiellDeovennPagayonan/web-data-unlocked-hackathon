"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { PostCard } from "@/components/posts/PostCard"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Plus } from "lucide-react"

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

const tabs = ["For you", "Following", "Technology", "Programming", "Design"]

const staffPicks = [
  { author: "Sarah Chen", title: "The Future of Remote Work", id: "1" },
  { author: "James Wilson", title: "Why I Stopped Using JavaScript Frameworks", id: "2" },
  { author: "Maria Garcia", title: "Design Systems at Scale", id: "3" },
]

const recommendedTopics = ["Technology", "Writing", "Productivity", "Design", "AI", "Startup", "Career", "Life"]

const whoToFollow = [
  { name: "Alex Rivera", bio: "Engineering leader & writer" },
  { name: "Priya Patel", bio: "Product designer at Stripe" },
  { name: "David Kim", bio: "Startup founder & investor" },
]

function SkeletonCard() {
  return (
    <div className="pb-6 border-b border-[#E5E5E5]">
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#F2F2F2] animate-pulse" />
            <div className="w-24 h-3 bg-[#F2F2F2] rounded animate-pulse" />
          </div>
          <div className="w-3/4 h-6 bg-[#F2F2F2] rounded animate-pulse" />
          <div className="w-full h-4 bg-[#F2F2F2] rounded animate-pulse" />
          <div className="w-1/2 h-4 bg-[#F2F2F2] rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-16 h-3 bg-[#F2F2F2] rounded animate-pulse" />
            <div className="w-16 h-3 bg-[#F2F2F2] rounded animate-pulse" />
          </div>
        </div>
        <div className="hidden md:block shrink-0 w-[200px] h-[134px] bg-[#F2F2F2] rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function FeedPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("For you")

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
    <div className="min-h-screen bg-[#F7F4ED] flex flex-col">
      <Header />
      <main className="max-w-[1192px] mx-auto px-6 py-8 flex-1 w-full">
        <div className="flex gap-12">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            {/* Topic tabs */}
            <div className="flex gap-6 mb-8 overflow-x-auto pb-2 border-b border-[#E5E5E5]">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-[14px] whitespace-nowrap transition-colors duration-150 ${
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
            {initialLoading ? (
              <div className="space-y-8">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-[#6B6B6B]">
                <p className="text-lg font-medium" style={{ fontFamily: '"GT Super", Georgia, serif' }}>No posts yet</p>
                <p className="text-sm mt-1">
                  {session
                    ? "Follow some users or create the first post!"
                    : "Be the first to post — sign up now."}
                </p>
                {!session && (
                  <Button asChild className="mt-4 rounded-full bg-[#FFC017] text-[#242424] hover:bg-[#E5AC00] border-none">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                )}
              </div>
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

                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                      className="rounded-full px-6 border-[#242424] text-[#242424] hover:bg-[#F2F2F2]"
                    >
                      {loading ? "Loading..." : "Load more"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[360px] shrink-0">
            <div className="sticky top-[95px] space-y-10">
              {/* New post CTA */}
              {session && (
                <Link
                  href="/post/create"
                  className="flex items-center gap-2 text-[14px] text-[#1A8917] hover:text-[#146d12] transition-colors duration-150"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write a story</span>
                </Link>
              )}

              {/* Staff Picks */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#242424] mb-4 uppercase tracking-wide">
                  Staff Picks
                </h3>
                <div className="space-y-4">
                  {staffPicks.map((pick) => (
                    <div key={pick.id}>
                      <p className="text-[13px] text-[#6B6B6B] mb-0.5">{pick.author}</p>
                      <p className="text-[14px] font-bold text-[#242424] leading-snug hover:underline cursor-pointer"
                        style={{ fontFamily: '"GT Super", Georgia, serif' }}
                      >
                        {pick.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Topics */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#242424] mb-4 uppercase tracking-wide">
                  Recommended Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recommendedTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1.5 bg-[#F2F2F2] rounded text-[13px] text-[#242424] hover:underline cursor-pointer transition-colors duration-150"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Who to Follow */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#242424] mb-4 uppercase tracking-wide">
                  Who to follow
                </h3>
                <div className="space-y-4">
                  {whoToFollow.map((person) => (
                    <div key={person.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[13px] font-semibold text-[#242424] shrink-0">
                          {person.name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#242424] truncate">{person.name}</p>
                          <p className="text-[12px] text-[#6B6B6B] truncate">{person.bio}</p>
                        </div>
                      </div>
                      <button className="ml-2 px-3 py-1 text-[13px] text-[#1A8917] border border-[#1A8917] rounded-full hover:bg-[#F2F2F2] transition-colors duration-150 shrink-0">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer borderTop />
    </div>
  )
}
