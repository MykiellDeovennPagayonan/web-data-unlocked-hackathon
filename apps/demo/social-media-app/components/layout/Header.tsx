"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="border-b border-border bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/feed" className="text-2xl font-bold text-primary">
            Social Media
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/feed" 
              className="text-text-secondary hover:text-primary transition-colors"
            >
              Feed
            </Link>
            {session && (
              <Link 
                href="/post/create" 
                className="text-text-secondary hover:text-primary transition-colors"
              >
                Create Post
              </Link>
            )}
            {session && (
              <Link 
                href={`/profile/${session.user.name}`} 
                className="text-text-secondary hover:text-primary transition-colors"
              >
                Profile
              </Link>
            )}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="w-20 h-8 bg-surface-alt animate-pulse rounded"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <span className="text-text-primary">{session.user.name}</span>
                    {session.user.isVerified && (
                      <Badge variant="secondary" className="bg-accent text-white">
                        ✓
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${session.user.name}`}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/post/create">Create Post</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
