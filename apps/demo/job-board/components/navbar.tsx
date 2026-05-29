"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Briefcase, Building2, LogOut, LayoutDashboard, Search, MessageSquare, DollarSign, Star } from "lucide-react"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-border-strong bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl flex items-center gap-2 text-glassdoor-green">
            <Briefcase className="h-6 w-6" />
            <span className="text-text-primary">JobBoard</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/jobs">
              <Button variant="ghost" className="text-text-secondary hover:text-text-primary font-medium">
                <Search className="h-4 w-4 mr-1.5" />
                Jobs
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost" className="text-text-secondary hover:text-text-primary font-medium">
                <Building2 className="h-4 w-4 mr-1.5" />
                Companies
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost" className="text-text-secondary hover:text-text-primary font-medium">
                <DollarSign className="h-4 w-4 mr-1.5" />
                Salaries
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost" className="text-text-secondary hover:text-text-primary font-medium">
                <Star className="h-4 w-4 mr-1.5" />
                Reviews
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost" className="text-text-secondary hover:text-text-primary font-medium">
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Interviews
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              {session.user.role === "INDIVIDUAL" && (
                <Link href="/dashboard/applications" className="hidden sm:block">
                  <Button variant="ghost" className="text-text-secondary hover:text-text-primary font-medium">
                    <LayoutDashboard className="h-4 w-4 mr-1.5" />
                    My Applications
                  </Button>
                </Link>
              )}

              {session.user.role === "ORGANIZATION" && (
                <Link href="/dashboard/jobs" className="hidden sm:block">
                  <Button variant="ghost" className="text-text-secondary hover:text-text-primary font-medium">
                    <Building2 className="h-4 w-4 mr-1.5" />
                    My Jobs
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-text-muted hover:text-text-primary"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="text-text-secondary hover:text-text-primary font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold rounded px-5">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
