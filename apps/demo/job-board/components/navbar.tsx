"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Briefcase, User, Building2, LogOut, LayoutDashboard } from "lucide-react"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Job Board
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="ghost">Jobs</Button>
          </Link>

          {/* {!session?.user && (
            <Link href="/signup/organization">
              <Button variant="ghost">For Organizations</Button>
            </Link>
          )} */}

          {session?.user ? (
            <>
              {session.user.role === "INDIVIDUAL" && (
                <Link href="/dashboard/applications">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    My Applications
                  </Button>
                </Link>
              )}

              {session.user.role === "ORGANIZATION" && (
                <Link href="/dashboard/jobs">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    My Jobs
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-2 pl-4 border-l">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
