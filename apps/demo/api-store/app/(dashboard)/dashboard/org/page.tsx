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

  const totalCalls = stats?.endpoints.reduce((s, e) => s + e.totalCalls, 0) ?? 0
  const totalEarned = stats?.endpoints.reduce((s, e) => s + e.totalEarned, 0) ?? 0

  if (loading) {
    return <div className="text-muted-foreground">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organization Dashboard</h1>
          <p className="text-muted-foreground">Monitor your APIs and earnings</p>
        </div>
        <Button asChild>
          <Link href="/endpoints/new">
            <Plus className="h-4 w-4 mr-2" />
            New Endpoint
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Earnings Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.earningsBalance ?? 0).toFixed(4)}</div>
            <p className="text-xs text-muted-foreground mt-1">Accumulated from paid API calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all your endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarned.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground mt-1">From {stats?.endpoints.length ?? 0} endpoint(s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Endpoint Statistics
              </CardTitle>
              <CardDescription>Per-endpoint call counts and revenue</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/endpoints">Manage Endpoints</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!stats || stats.endpoints.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No endpoints yet.</p>
              <Button asChild>
                <Link href="/endpoints/new">Create your first endpoint</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.endpoints.map((ep) => (
                <div key={ep.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{ep.name}</span>
                      <Badge variant={ep.isActive ? "default" : "secondary"}>
                        {ep.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">${ep.pricePer1k}/1k calls</span>
                  </div>
                  {ep.description && (
                    <p className="text-sm text-muted-foreground">{ep.description}</p>
                  )}
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <p className="font-bold text-lg">{ep.totalCalls}</p>
                      <p className="text-xs text-muted-foreground">Total calls</p>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <p className="font-bold text-lg">{ep.freeCalls}</p>
                      <p className="text-xs text-muted-foreground">Free trials</p>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <p className="font-bold text-lg">{ep.paidCalls}</p>
                      <p className="text-xs text-muted-foreground">Paid calls</p>
                    </div>
                    <div className="text-center p-2 bg-primary/10 rounded">
                      <p className="font-bold text-lg text-primary">${ep.totalEarned.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">Earned</p>
                    </div>
                  </div>

                  {ep.recentActivity.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Recent Activity
                      </p>
                      <div className="space-y-1">
                        {ep.recentActivity.slice(0, 5).map((act, i) => (
                          <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                            <Badge variant={act.isFree ? "secondary" : "outline"} className="text-xs">
                              {act.isFree ? "Free" : `$${act.costCharged.toFixed(4)}`}
                            </Badge>
                            <span>{new Date(act.createdAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
