"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, ArrowLeft } from "lucide-react"

interface EndpointStat {
  id: string
  name: string
  pricePer1k: number
  isActive: boolean
  totalCalls: number
  freeCalls: number
  paidCalls: number
  totalEarned: number
  recentActivity: { isFree: boolean; costCharged: number; createdAt: string }[]
}

interface OrgStats {
  earningsBalance: number
  endpoints: EndpointStat[]
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<OrgStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats/org")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const maxCalls = Math.max(...(stats?.endpoints.map((e) => e.totalCalls) ?? [1]), 1)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="text-text-secondary hover:text-text-primary">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics
          </h1>
          <p className="text-text-secondary mt-1">Detailed statistics across all your endpoints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-secondary">Total Earnings Balance</span>
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight">${(stats?.earningsBalance ?? 0).toFixed(4)}</p>
        </div>
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-secondary">Total Revenue Generated</span>
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight">
            ${stats?.endpoints.reduce((s, e) => s + e.totalEarned, 0).toFixed(4) ?? "0.0000"}
          </p>
        </div>
      </div>

      {/* Activity bar chart */}
      <div className="bg-white border border-border-light rounded-xl p-6">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-1">Call Volume by Endpoint</h2>
        <p className="text-sm text-text-secondary mb-6">Relative call volume for each endpoint</p>
        {!stats || stats.endpoints.length === 0 ? (
          <p className="text-text-muted text-sm">No endpoints yet.</p>
        ) : (
          <div className="space-y-4">
            {stats.endpoints.map((ep) => (
              <div key={ep.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-text-primary">{ep.name}</span>
                  <span className="text-text-muted">{ep.totalCalls} calls</span>
                </div>
                <div className="h-3 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-kaggle-blue rounded-full transition-all"
                    style={{ width: `${(ep.totalCalls / maxCalls) * 100}%` }}
                  />
                </div>
                <div className="flex gap-3 text-xs text-text-muted">
                  <span>{ep.freeCalls} free</span>
                  <span>{ep.paidCalls} paid</span>
                  <span className="text-kaggle-blue font-medium">${ep.totalEarned.toFixed(4)} earned</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-endpoint detail */}
      <div className="space-y-4">
        {stats?.endpoints.map((ep) => (
          <div key={ep.id} className="bg-white border border-border-light rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-text-primary">{ep.name}</h3>
                <Badge className={ep.isActive ? "bg-green-50 text-green-700 border-0 text-xs font-medium" : "bg-gray-100 text-gray-600 border-0 text-xs font-medium"}>
                  {ep.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <span className="text-sm text-text-secondary">${ep.pricePer1k}/1k calls</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
              {[
                { label: "Total Calls", value: ep.totalCalls },
                { label: "Free Trials", value: ep.freeCalls },
                { label: "Paid Calls", value: ep.paidCalls },
                { label: "Earned", value: `$${ep.totalEarned.toFixed(4)}` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-surface-muted rounded-xl">
                  <p className="font-bold text-lg text-text-primary">{value}</p>
                  <p className="text-xs text-text-muted">{label}</p>
                </div>
              ))}
            </div>

            {ep.recentActivity.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-muted mb-2">Recent Activity (last 10)</p>
                <div className="space-y-1 max-h-40 overflow-auto">
                  {ep.recentActivity.map((act, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border-subtle last:border-0">
                      <Badge className={act.isFree ? "bg-sky-50 text-sky-600 border-0 text-[11px] font-medium" : "bg-amber-50 text-amber-700 border-0 text-[11px] font-medium"}>
                        {act.isFree ? "Free" : `$${act.costCharged.toFixed(6)}`}
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
    </div>
  )
}
