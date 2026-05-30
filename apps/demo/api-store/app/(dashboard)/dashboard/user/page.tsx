"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
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
  const { data: session } = useSession()
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
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">My Dashboard</h1>
          {session?.user?.isVerified && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
              <span>✓</span> TrustLayer Verified
            </span>
          )}
        </div>
        <p className="text-text-secondary mt-1">Your API usage and credits overview</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-secondary">Credit Balance</span>
            <DollarSign className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight">${(stats?.creditBalance ?? 0).toFixed(4)}</p>
          <Button size="sm" className="mt-3 bg-kaggle-blue hover:bg-kaggle-blue-hover text-white h-8" onClick={() => setTopUpOpen(true)}>
            Top Up
          </Button>
        </div>

        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-secondary">Total API Calls</span>
            <Zap className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight">{totalCalls}</p>
          <p className="text-xs text-text-muted mt-1">Across all endpoints</p>
        </div>

        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-secondary">Total Spent</span>
            <TrendingUp className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight">${totalSpent.toFixed(4)}</p>
          <p className="text-xs text-text-muted mt-1">In paid API calls</p>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white border border-border-light rounded-xl p-6">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-1">API Key</h2>
        <p className="text-sm text-text-secondary mb-4">Use this key in the x-api-key header when calling endpoints</p>
        {apiKey ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-surface-muted px-3 py-2.5 rounded text-sm font-mono text-text-primary truncate">
              {apiKey.key}
            </code>
            <Button size="sm" variant="outline" onClick={copyKey} className="h-9 border-border-light hover:bg-surface-muted">
              {copiedKey ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={generateKey} className="h-9 border-border-light hover:bg-surface-muted">
              Regenerate
            </Button>
          </div>
        ) : (
          <Button onClick={generateKey} className="bg-kaggle-blue hover:bg-kaggle-blue-hover text-white h-9">
            Generate API Key
          </Button>
        )}
      </div>

      {/* Per-endpoint breakdown */}
      <div className="bg-white border border-border-light rounded-xl p-6">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-1">Usage by Endpoint</h2>
        <p className="text-sm text-text-secondary mb-4">Breakdown of your API calls and spending per endpoint</p>
        {!stats || stats.byEndpoint.length === 0 ? (
          <p className="text-text-muted text-sm">No API calls yet. Visit the marketplace to explore endpoints.</p>
        ) : (
          <div className="space-y-2">
            {stats.byEndpoint.map((ep) => (
              <div key={ep.endpointId} className="flex items-center justify-between p-3 rounded bg-surface-muted hover:bg-surface transition-colors">
                <div>
                  <p className="font-medium text-sm text-text-primary">{ep.endpointName}</p>
                  <p className="text-xs text-text-secondary">{ep.orgName}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-text-primary">{ep.totalCalls}</p>
                    <p className="text-xs text-text-muted">calls</p>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-sky-50 text-sky-600 border-0 text-xs font-medium">{ep.freeCalls} free</Badge>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-kaggle-blue">${ep.totalSpent.toFixed(4)}</p>
                    <p className="text-xs text-text-muted">spent</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-border-light rounded-xl p-6">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </h2>
        {!stats || stats.recentLogs.length === 0 ? (
          <p className="text-text-muted text-sm">No recent activity.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="pb-2 text-text-muted font-medium">Endpoint</th>
                  <th className="pb-2 text-text-muted font-medium">Cost</th>
                  <th className="pb-2 text-text-muted font-medium">Status</th>
                  <th className="pb-2 text-text-muted font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-muted transition-colors">
                    <td className="py-3 font-medium text-text-primary">{log.endpoint.name}</td>
                    <td className="py-3">
                      <Badge className={log.isFree ? "bg-sky-50 text-sky-600 border-0 text-xs font-medium" : "bg-amber-50 text-amber-700 border-0 text-xs font-medium"}>
                        {log.isFree ? "Free" : `$${log.costCharged.toFixed(4)}`}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium ${log.statusCode && log.statusCode < 400 ? "text-green-600" : "text-red-500"}`}>
                        {log.statusCode ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 text-right text-text-muted text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-sm bg-white border-border-light">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Top Up Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Enter an amount in USD to add to your credit balance (mock payment).</p>
            <Input
              type="number"
              placeholder="Amount in USD (e.g. 10)"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="bg-surface-muted border-border-light focus:border-kaggle-blue"
            />
            <div className="flex gap-2">
              {[5, 10, 25, 50].map((amt) => (
                <Button key={amt} variant="outline" size="sm" onClick={() => setTopUpAmount(String(amt))} className="border-border-light hover:bg-surface-muted text-text-secondary">
                  ${amt}
                </Button>
              ))}
            </div>
            <Button className="w-full bg-kaggle-blue hover:bg-kaggle-blue-hover text-white" onClick={handleTopUp} disabled={topping}>
              {topping ? "Processing..." : "Confirm Payment (Mock)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
