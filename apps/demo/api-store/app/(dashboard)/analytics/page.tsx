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

  if (loading) return <div className="text-muted-foreground">Loading analytics...</div>

  const maxCalls = Math.max(...(stats?.endpoints.map((e) => e.totalCalls) ?? [1]), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics
          </h1>
          <p className="text-muted-foreground">Detailed statistics across all your endpoints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(stats?.earningsBalance ?? 0).toFixed(4)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats?.endpoints.reduce((s, e) => s + e.totalEarned, 0).toFixed(4) ?? "0.0000"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity bar chart (visual) */}
      <Card>
        <CardHeader>
          <CardTitle>Call Volume by Endpoint</CardTitle>
          <CardDescription>Relative call volume for each endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          {!stats || stats.endpoints.length === 0 ? (
            <p className="text-muted-foreground text-sm">No endpoints yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.endpoints.map((ep) => (
                <div key={ep.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{ep.name}</span>
                    <span className="text-muted-foreground">{ep.totalCalls} calls</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(ep.totalCalls / maxCalls) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{ep.freeCalls} free</span>
                    <span>·</span>
                    <span>{ep.paidCalls} paid</span>
                    <span>·</span>
                    <span className="text-primary">${ep.totalEarned.toFixed(4)} earned</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-endpoint detail */}
      <div className="space-y-4">
        {stats?.endpoints.map((ep) => (
          <Card key={ep.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{ep.name}</CardTitle>
                  <Badge variant={ep.isActive ? "default" : "secondary"}>
                    {ep.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">${ep.pricePer1k}/1k calls</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 text-sm mb-4">
                {[
                  { label: "Total Calls", value: ep.totalCalls },
                  { label: "Free Trials", value: ep.freeCalls },
                  { label: "Paid Calls", value: ep.paidCalls },
                  { label: "Earned", value: `$${ep.totalEarned.toFixed(4)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="font-bold text-lg">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {ep.recentActivity.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Recent Activity (last 10)</p>
                  <div className="space-y-1 max-h-40 overflow-auto">
                    {ep.recentActivity.map((act, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                        <Badge variant={act.isFree ? "secondary" : "outline"} className="text-xs">
                          {act.isFree ? "Free" : `$${act.costCharged.toFixed(6)}`}
                        </Badge>
                        <span className="text-muted-foreground">{new Date(act.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
