"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DollarSign, Zap, TrendingUp, Clock, Copy, Check } from "lucide-react"

interface EndpointStat {
  endpointId: string
  endpointName: string
  orgName: string
  totalCalls: number
  freeCalls: number
  paidCalls: number
  totalSpent: number
}

interface RecentLog {
  id: string
  endpointId: string
  isFree: boolean
  costCharged: number
  statusCode: number | null
  createdAt: string
  endpoint: { name: string }
}

export default function UserDashboard() {
  const [stats, setStats] = useState<{
    creditBalance: number
    byEndpoint: EndpointStat[]
    recentLogs: RecentLog[]
  } | null>(null)
  const [apiKey, setApiKey] = useState<{ key: string } | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState("")
  const [topping, setTopping] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchKey()
  }, [])

  async function fetchStats() {
    const res = await fetch("/api/stats/user")
    if (res.ok) setStats(await res.json())
  }

  async function fetchKey() {
    const res = await fetch("/api/keys")
    if (res.ok) {
      const data = await res.json()
      setApiKey(data)
    }
  }

  async function generateKey() {
    const res = await fetch("/api/keys", { method: "POST" })
    if (res.ok) setApiKey(await res.json())
  }

  async function copyKey() {
    if (!apiKey) return
    await navigator.clipboard.writeText(apiKey.key)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  async function handleTopUp() {
    const amount = parseFloat(topUpAmount)
    if (!amount || amount <= 0) return
    setTopping(true)
    const res = await fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
    if (res.ok) {
      await fetchStats()
      setTopUpOpen(false)
      setTopUpAmount("")
    }
    setTopping(false)
  }

  const totalSpent = stats?.byEndpoint.reduce((s, e) => s + e.totalSpent, 0) ?? 0
  const totalCalls = stats?.byEndpoint.reduce((s, e) => s + e.totalCalls, 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Your API usage and credits overview</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.creditBalance ?? 0).toFixed(4)}</div>
            <Button size="sm" className="mt-2" onClick={() => setTopUpOpen(true)}>
              Top Up
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground mt-1">In paid API calls</p>
          </CardContent>
        </Card>
      </div>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>Use this key in the x-api-key header when calling endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {apiKey ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                {apiKey.key}
              </code>
              <Button size="sm" variant="outline" onClick={copyKey}>
                {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={generateKey}>
                Regenerate
              </Button>
            </div>
          ) : (
            <Button onClick={generateKey}>Generate API Key</Button>
          )}
        </CardContent>
      </Card>

      {/* Per-endpoint breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Usage by Endpoint</CardTitle>
          <CardDescription>Breakdown of your API calls and spending per endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          {!stats || stats.byEndpoint.length === 0 ? (
            <p className="text-muted-foreground text-sm">No API calls yet. Visit the marketplace to explore endpoints.</p>
          ) : (
            <div className="space-y-3">
              {stats.byEndpoint.map((ep) => (
                <div key={ep.endpointId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{ep.endpointName}</p>
                    <p className="text-xs text-muted-foreground">{ep.orgName}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{ep.totalCalls}</p>
                      <p className="text-xs text-muted-foreground">calls</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary">{ep.freeCalls} free</Badge>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-primary">${ep.totalSpent.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">spent</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!stats || stats.recentLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.endpoint.name}</span>
                    <Badge variant={log.isFree ? "secondary" : "default"} className="text-xs">
                      {log.isFree ? "Free" : `$${log.costCharged.toFixed(4)}`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className={`text-xs ${log.statusCode && log.statusCode < 400 ? "text-green-600" : "text-red-500"}`}>
                      {log.statusCode ?? "—"}
                    </span>
                    <span className="text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Up Modal */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Top Up Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter an amount in USD to add to your credit balance (mock payment).</p>
            <Input
              type="number"
              placeholder="Amount in USD (e.g. 10)"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
            <div className="flex gap-2">
              {[5, 10, 25, 50].map((amt) => (
                <Button key={amt} variant="outline" size="sm" onClick={() => setTopUpAmount(String(amt))}>
                  ${amt}
                </Button>
              ))}
            </div>
            <Button className="w-full" onClick={handleTopUp} disabled={topping}>
              {topping ? "Processing..." : "Confirm Payment (Mock)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
