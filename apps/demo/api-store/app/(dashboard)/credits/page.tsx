"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  type: "TOPUP" | "DEDUCTION"
  description: string | null
  createdAt: string
}

export default function CreditsPage() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCredits()
  }, [])

  async function fetchCredits() {
    const res = await fetch("/api/credits")
    if (res.ok) {
      const data = await res.json()
      setBalance(data.balance)
      setTransactions(data.transactions)
    }
  }

  async function topUp() {
    const val = parseFloat(amount)
    if (!val || val <= 0) return
    setLoading(true)
    await fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: val }),
    })
    setAmount("")
    await fetchCredits()
    setLoading(false)
  }

  const totalTopUps = transactions.filter((t) => t.type === "TOPUP").reduce((s, t) => s + t.amount, 0)
  const totalSpent = transactions.filter((t) => t.type === "DEDUCTION").reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Credits</h1>
        <p className="text-muted-foreground">Manage your credit balance for paid API calls</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.toFixed(4)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Topped Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTopUps.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(4)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top-up form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Credits</CardTitle>
          <CardDescription>Mock payment — no real charges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            {[5, 10, 25, 50].map((amt) => (
              <Button
                key={amt}
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(amt))}
              >
                ${amt}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Custom amount (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
            <Button onClick={topUp} disabled={loading || !amount}>
              {loading ? "Processing..." : "Top Up"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent credit transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={tx.type === "TOPUP" ? "default" : "secondary"}>
                      {tx.type === "TOPUP" ? "Top-up" : "Deduction"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{tx.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold text-sm ${tx.type === "TOPUP" ? "text-green-600" : "text-red-500"}`}>
                      {tx.type === "TOPUP" ? "+" : ""}${Math.abs(tx.amount).toFixed(4)}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
