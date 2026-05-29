"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Globe,
  Key,
  CreditCard,
  BarChart3,
  Plus,
  LogOut,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface SidebarProps {
  role: string
  userName: string
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

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const links = role === "ORGANIZATION" ? orgLinks : individualLinks

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col py-6 px-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">API Store</h1>
        <p className="text-xs text-muted-foreground mt-1 truncate">{userName}</p>
        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          {role === "ORGANIZATION" ? "Organization" : "Individual"}
        </span>
      </div>

      <Separator className="mb-4" />

      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <Separator className="my-4" />

      <Button
        variant="ghost"
        size="sm"
        className="justify-start gap-3 text-muted-foreground hover:text-foreground"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </aside>
  )
}
