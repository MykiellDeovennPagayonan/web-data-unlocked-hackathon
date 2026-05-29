"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, DollarSign, Copy, Check, ArrowRight, TrendingUp, Clock, Filter, Search } from "lucide-react"
import Link from "next/link"

interface ApiEndpoint {
  id: string
  name: string
  description: string | null
  forwardUrl: string
  samplePayload: string | null
  sampleResponse: string | null
  pricePer1k: number
  isActive: boolean
  createdAt: string
  orgProfile: {
    userId: string
    user: { name: string }
  }
}

const filters = ["All", "Trending", "Newest", "Most Used"]
const categories = ["All", "Finance", "ML", "Geo", "Social", "Data"]

export default function MarketplacePage() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState("All")
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetch("/api/endpoints")
      .then((r) => r.json())
      .then((d) => setEndpoints(d))
      .finally(() => setLoading(false))
  }, [])

  function copyUrl(id: string) {
    const url = `${window.location.origin}/api/proxy/${id}`
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const filtered = endpoints.filter((ep) => {
    if (!searchQuery) return true
    return (
      ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ep.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    )
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 bg-surface-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">API Marketplace</h1>
        <p className="text-text-secondary mt-1">Browse and use APIs from organizations. First 50 calls per endpoint are free.</p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search APIs, endpoints, organizations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-full bg-surface-muted border border-transparent focus:border-kaggle-blue focus:outline-none text-sm text-text-primary placeholder:text-text-muted transition-colors"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-text-muted shrink-0" />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === f
                  ? "bg-kaggle-blue text-white"
                  : "bg-surface-muted text-text-secondary hover:bg-border-light"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === c
                  ? "bg-kaggle-blue text-white"
                  : "bg-surface-muted text-text-secondary hover:bg-border-light"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-muted">
        {filtered.length} {filtered.length === 1 ? "API" : "APIs"} available
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-border-light rounded-xl bg-surface">
          <Globe className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary font-medium">No APIs match your search</p>
          <p className="text-text-muted text-sm mt-1">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((ep) => (
            <div
              key={ep.id}
              className="group bg-white border border-border-light rounded-xl overflow-hidden hover:border-text-muted hover:bg-surface transition-colors"
            >
              {/* Thumbnail placeholder */}
              <div className="w-full h-32 bg-surface-muted flex items-center justify-center border-b border-border-subtle">
                <Globe className="h-10 w-10 text-text-muted" />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-kaggle-blue transition-colors line-clamp-1">
                    {ep.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-4 h-4 rounded-full bg-surface-muted border border-border-light flex items-center justify-center">
                      <span className="text-[9px] font-bold text-text-secondary">
                        {ep.orgProfile.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary">{ep.orgProfile.user.name}</span>
                  </div>
                </div>
                {ep.description && (
                  <p className="text-xs text-text-muted line-clamp-2">{ep.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    0
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(ep.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                  <Badge variant="outline" className="text-[11px] font-medium border-border-light text-text-secondary">
                    <DollarSign className="h-3 w-3 mr-0.5" />
                    ${ep.pricePer1k}/1k
                  </Badge>
                  <Badge className="text-[11px] bg-sky-50 text-sky-600 border-0 font-medium">
                    50 free
                  </Badge>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs border-border-light hover:bg-surface-muted"
                    onClick={() => copyUrl(ep.id)}
                  >
                    {copied === ep.id ? (
                      <Check className="h-3 w-3 mr-1 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    Copy URL
                  </Button>
                  <Button size="sm" asChild className="h-8 text-xs bg-kaggle-blue hover:bg-kaggle-blue-hover text-white">
                    <Link href={`/marketplace/${ep.id}`}>
                      Try it
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
