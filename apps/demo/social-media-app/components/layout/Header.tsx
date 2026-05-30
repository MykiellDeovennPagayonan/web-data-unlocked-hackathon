"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Bell, PenLine } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isLanding = pathname === "/"
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!isLanding) return
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isLanding])

  const headerBg = isLanding && !scrolled
    ? "bg-transparent border-transparent"
    : "bg-white border-[#E5E5E5]"

  return (
    <header className={`border-b sticky top-0 z-50 transition-colors duration-200 ${headerBg}`}>
      <div className="max-w-[1192px] mx-auto px-6">
        <div className="flex justify-between items-center h-[75px]">
          {/* Logo */}
          <Link
            href="/"
            className="text-[26px] font-bold tracking-tight text-black"
            style={{ fontFamily: '"GT Super", Georgia, serif' }}
          >
            Publish
          </Link>

          {/* Auth buttons */}
          <div className="flex items-center gap-5 md:gap-6">
            {status === "loading" ? (
              <div className="w-20 h-8 bg-[#F2F2F2] animate-pulse rounded-full"></div>
            ) : session ? (
              <>
                <Link
                  href="/feed"
                  className="hidden md:flex items-center text-[14px] text-[#6B6B6B] hover:text-[#242424] transition-colors duration-150"
                >
                  <Search className="w-5 h-5" />
                </Link>
                <Link
                  href="/post/create"
                  className="hidden md:flex items-center gap-1.5 text-[14px] text-[#6B6B6B] hover:text-[#242424] transition-colors duration-150"
                >
                  <PenLine className="w-4 h-4" />
                  <span>Write</span>
                </Link>
                <button aria-label="Notifications" className="hidden md:flex items-center text-[#6B6B6B] hover:text-[#242424] transition-colors duration-150">
                  <Bell className="w-5 h-5" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button aria-label="Open user menu" className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F2F2F2] text-[14px] font-medium text-[#242424] hover:bg-[#E5E5E5] transition-colors duration-150">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 mt-2">
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${session.user.name}`}>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/post/create">Create Post</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="hidden md:block text-[14px] text-[#6B6B6B] hover:text-[#242424] transition-colors duration-150"
                >
                  Our story
                </Link>
                <Link
                  href="/"
                  className="hidden md:block text-[14px] text-[#6B6B6B] hover:text-[#242424] transition-colors duration-150"
                >
                  Membership
                </Link>
                <Link
                  href="/post/create"
                  className="hidden md:flex items-center gap-1.5 text-[14px] text-[#6B6B6B] hover:text-[#242424] transition-colors duration-150"
                >
                  <PenLine className="w-4 h-4" />
                  <span>Write</span>
                </Link>
                <Link
                  href="/login"
                  className="text-[14px] text-[#242424] hover:text-[#000000] transition-colors duration-150"
                >
                  Sign in
                </Link>
                <Button
                  asChild
                  className="rounded-full px-4 h-[38px] text-[13px] font-medium bg-[#FFC017] text-[#242424] hover:bg-[#E5AC00] border-none"
                >
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
