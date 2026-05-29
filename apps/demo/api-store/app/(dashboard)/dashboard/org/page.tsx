"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Zap, BarChart3, Plus, Clock, TrendingUp } from "lucide-react"

interface EndpointStat {
  id: string
  name: string
  description: string | null
  pricePer1k: number
  isActive: boolean
  createdAt: string
  totalCalls: number
  freeCalls: number
  paidCalls: number
  totalEarned: number
  recentActivity: { isFree: boolean; costCharged: number; createdAt: string; userId: string }[]
}

interface OrgStats {
  earningsBalance: number
  endpoints: EndpointStat[]
}

export default function OrgDashboard() {
  const [stats, setStats] = useState<OrgStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats/org")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false))
  }, [])

  const totalCalls = (stats?.endpoints ?? []).reduce((s, e) => s + e.totalCalls, 0)
  const totalEarned = (stats?.endpoints ?? []).reduce((s, e) => s + e.totalEarned, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-surface-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Organization Dashboard</h1>
          <p className="text-text-secondary mt-1">Monitor your APIs and earnings</p>
        </div>
        <Button asChild className="bg-kaggle-blue hover:bg-kaggle-blue-hover text-white h-10">
          <Link href="/endpoints/new">
            <Plus className="h-4 w-4 mr-2" />
            New Endpoint
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-secondary">Earnings Balance</span>
            <DollarSign className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight">${(stats?.earningsBalance ?? 0).toFixed(4)}</p>
          <p className="text-xs text-text-muted mt-1">Accumulated from paid API calls</p>
        </div>

        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-secondary">Total API Calls</span>
            <Zap className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight">{totalCalls}</p>
          <p className="text-xs text-text-muted mt-1">Across all your endpoints</p>
        </div>

        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-secondary">Total Earned</span>
            <TrendingUp className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight">${totalEarned.toFixed(4)}</p>
          <p className="text-xs text-text-muted mt-1">From {(stats?.endpoints ?? []).length} endpoint(s)</p>
        </div>
      </div>

      {/* Endpoint breakdown */}
      <div className="bg-white border border-border-light rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Endpoint Statistics
            </h2>
            <p className="text-sm text-text-secondary mt-1">Per-endpoint call counts and revenue</p>
          </div>
          <Button asChild variant="outline" size="sm" className="border-border-light text-text-secondary hover:bg-surface-muted h-8">
            <Link href="/endpoints">Manage Endpoints</Link>
          </Button>
        </div>
        {!stats || (stats.endpoints ?? []).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary mb-4">No endpoints yet.</p>
            <Button asChild className="bg-kaggle-blue hover:bg-kaggle-blue-hover text-white">
              <Link href="/endpoints/new">Create your first endpoint</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.endpoints.map((ep) => (
              <div key={ep.id} className="border border-border-light rounded-xl p-4 space-y-3 hover:bg-surface transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{ep.name}</span>
                    <Badge className={ep.isActive ? "bg-green-50 text-green-700 border-0 text-xs font-medium" : "bg-gray-100 text-gray-600 border-0 text-xs font-medium"}>
                      {ep.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <span className="text-sm text-text-secondary">${ep.pricePer1k}/1k calls</span>
                </div>
                {ep.description && (
                  <p className="text-sm text-text-secondary">{ep.description}</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="text-center p-3 bg-surface-muted rounded">
                    <p className="font-bold text-lg text-text-primary">{ep.totalCalls}</p>
                    <p className="text-xs text-text-muted">Total calls</p>
                  </div>
                  <div className="text-center p-3 bg-surface-muted rounded">
                    <p className="font-bold text-lg text-text-primary">{ep.freeCalls}</p>
                    <p className="text-xs text-text-muted">Free trials</p>
                  </div>
                  <div className="text-center p-3 bg-surface-muted rounded">
                    <p className="font-bold text-lg text-text-primary">{ep.paidCalls}</p>
                    <p className="text-xs text-text-muted">Paid calls</p>
                  </div>
                  <div className="text-center p-3 bg-sky-50 rounded">
                    <p className="font-bold text-lg text-kaggle-blue">${ep.totalEarned.toFixed(4)}</p>
                    <p className="text-xs text-text-muted">Earned</p>
                  </div>
                </div>

                {ep.recentActivity.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-muted mb-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Recent Activity
                    </p>
                    <div className="space-y-1">
                      {ep.recentActivity.slice(0, 5).map((act, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-text-secondary py-1 border-b border-border-subtle last:border-0">
                          <Badge className={act.isFree ? "bg-sky-50 text-sky-600 border-0 text-[11px] font-medium" : "bg-amber-50 text-amber-700 border-0 text-[11px] font-medium"}>
                            {act.isFree ? "Free" : `$${act.costCharged.toFixed(4)}`}
                          </Badge>
                          <span className="text-text-muted">{new Date(act.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
