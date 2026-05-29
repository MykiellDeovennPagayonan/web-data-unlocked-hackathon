"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Globe,
  Key,
  CreditCard,
  BarChart3,
  Plus,
  Zap,
  Layers,
  MessageSquare,
  Trophy,
} from "lucide-react"

interface SidebarProps {
  role: string
  userName?: string
  mobile?: boolean
  onClose?: () => void
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
  { href: "/marketplace", label: "Marketplace", icon: Globe },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

const secondaryLinks = [
  { href: "/marketplace", label: "Competitions", icon: Trophy },
  { href: "/marketplace", label: "Datasets", icon: Layers },
  { href: "/marketplace", label: "Notebooks", icon: BarChart3 },
  { href: "/marketplace", label: "Discussions", icon: MessageSquare },
]

export default function Sidebar({ role, userName, mobile, onClose }: SidebarProps) {
  const pathname = usePathname()
  const links = role === "ORGANIZATION" ? orgLinks : individualLinks

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-surface border-r border-border-light",
        mobile ? "w-full" : "w-64"
      )}
    >
      {/* Create button */}
      <div className="p-4">
        <Link
          href="/endpoints/new"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full h-10 rounded bg-kaggle-blue text-white text-sm font-medium hover:bg-kaggle-blue-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors",
              pathname === href
                ? "bg-kaggle-blue/10 text-kaggle-blue"
                : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        {/* Divider */}
        <div className="my-2 border-t border-border-subtle" />

        {/* Secondary nav */}
        {secondaryLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors",
              pathname === href
                ? "bg-kaggle-blue/10 text-kaggle-blue"
                : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-border-light">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-muted border border-border-light flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-text-secondary">
              {(userName || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{userName || "User"}</p>
            <p className="text-xs text-text-muted capitalize">{role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
