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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Credits</h1>
        <p className="text-text-secondary mt-1">Manage your credit balance for paid API calls</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-text-muted" />
            <span className="text-sm font-medium text-text-secondary">Balance</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">${balance.toFixed(4)}</p>
        </div>
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-text-secondary">Total Topped Up</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">${totalTopUps.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-text-secondary">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">${totalSpent.toFixed(4)}</p>
        </div>
      </div>

      {/* Top-up form */}
      <div className="bg-white border border-border-light rounded-xl p-6">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-1">Add Credits</h2>
        <p className="text-sm text-text-secondary mb-4">Mock payment — no real charges</p>
        <div className="space-y-3">
          <div className="flex gap-2">
            {[5, 10, 25, 50].map((amt) => (
              <Button
                key={amt}
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(amt))}
                className="border-border-light text-text-secondary hover:bg-surface-muted"
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
              className="bg-surface-muted border-border-light focus:border-kaggle-blue"
            />
            <Button onClick={topUp} disabled={loading || !amount} className="bg-kaggle-blue hover:bg-kaggle-blue-hover text-white">
              {loading ? "Processing..." : "Top Up"}
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white border border-border-light rounded-xl p-6">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-1">Transaction History</h2>
        <p className="text-sm text-text-secondary mb-4">Your recent credit transactions</p>
        {transactions.length === 0 ? (
          <p className="text-text-muted text-sm">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                <div className="flex items-center gap-2">
                  <Badge className={tx.type === "TOPUP" ? "bg-green-50 text-green-700 border-0 text-xs font-medium" : "bg-amber-50 text-amber-700 border-0 text-xs font-medium"}>
                    {tx.type === "TOPUP" ? "Top-up" : "Deduction"}
                  </Badge>
                  <span className="text-sm text-text-muted">{tx.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold text-sm ${tx.type === "TOPUP" ? "text-green-600" : "text-red-500"}`}>
                    {tx.type === "TOPUP" ? "+" : ""}${Math.abs(tx.amount).toFixed(4)}
                  </span>
                  <span className="text-xs text-text-muted">{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
