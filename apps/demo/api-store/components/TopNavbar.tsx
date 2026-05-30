"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  Plus,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Globe,
  Key,
  CreditCard,
  BarChart3,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopNavbarProps {
  role?: string
  userName?: string
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

const individualLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: Globe },
  { href: "/keys", label: "API Key", icon: Key },
  { href: "/credits", label: "Credits", icon: CreditCard },
]

const orgLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/endpoints", label: "My Endpoints", icon: Zap },
  { href: "/endpoints/new", label: "New Endpoint", icon: Plus },
  { href: "/marketplace", label: "Marketplace", icon: Globe },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

export default function TopNavbar({ role, userName, onMenuClick, sidebarOpen }: TopNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "")
  }, [searchParams])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const links = role === "ORGANIZATION" ? orgLinks : individualLinks

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-border-light">
      <div className="flex items-center h-full px-4 gap-4 max-w-[1440px] mx-auto">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md hover:bg-surface-muted transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="h-5 w-5 text-text-primary" /> : <Menu className="h-5 w-5 text-text-primary" />}
            </button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-kaggle-blue flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary hidden sm:block">API Store</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search APIs, endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = searchQuery.trim()
                  router.replace(q ? `/marketplace?q=${encodeURIComponent(q)}` : "/marketplace")
                }
              }}
              className="w-full h-10 pl-10 pr-4 rounded-full bg-surface-muted border border-transparent focus:border-kaggle-blue focus:outline-none text-sm text-text-primary placeholder:text-text-muted transition-colors"
            />
          </div>
        </div>

        {/* Right: Create, Notifications, Avatar */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Create dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setCreateOpen(!createOpen)}
              className="flex items-center gap-2 h-9 px-4 rounded bg-kaggle-blue text-white text-sm font-medium hover:bg-kaggle-blue-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </button>
            {createOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-[0_4px_12px_rgba(0,0,0,0.08)] py-1 z-50">
                <Link
                  href="/endpoints/new"
                  onClick={() => setCreateOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors"
                >
                  <Zap className="h-4 w-4 text-text-muted" />
                  New API
                </Link>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors w-full text-left"
                >
                  <Globe className="h-4 w-4 text-text-muted" />
                  New Dataset
                </button>
              </div>
            )}
          </div>

          {/* Notification */}
          <button
            className="relative p-2 rounded-md hover:bg-surface-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-text-primary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-muted transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-surface-muted border border-border-light flex items-center justify-center">
                <User className="h-4 w-4 text-text-secondary" />
              </div>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded shadow-[0_4px_12px_rgba(0,0,0,0.08)] py-1 z-50">
                <div className="px-4 py-2 border-b border-border-subtle">
                  <p className="text-sm font-medium text-text-primary">{userName || "User"}</p>
                  <p className="text-xs text-text-muted capitalize">{role?.toLowerCase()}</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-text-muted" />
                  Dashboard
                </Link>
                <Link
                  href="/keys"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors"
                >
                  <Key className="h-4 w-4 text-text-muted" />
                  API Keys
                </Link>
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    signOut({ callbackUrl: "/login" })
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4 text-text-muted" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click-away overlay for dropdowns */}
      {(createOpen || userMenuOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setCreateOpen(false); setUserMenuOpen(false) }} />
      )}
    </header>
  )
}
