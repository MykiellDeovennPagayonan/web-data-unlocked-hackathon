"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/applications/status-badge"
import { Building2, Clock, ArrowRight, FileCheck, Briefcase } from "lucide-react"

interface Application {
  id: string
  status: "PENDING" | "INTERVIEWING" | "ACCEPTED" | "REJECTED"
  appliedAt: string
  job: {
    id: string
    title: string
    organization: {
      user: { name: string }
    }
  }
}

const statusFilters = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Applied" },
  { key: "INTERVIEWING", label: "Interviewing" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "REJECTED", label: "Rejected" },
]

export default function MyApplicationsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState<string>("ALL")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch("/api/applications")
        if (response.ok) {
          const data = await response.json()
          setApplications(data)
        }
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  if (status === "loading" || !session || session.user.role !== "INDIVIDUAL") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-surface flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  const filtered = filter === "ALL" ? applications : applications.filter(a => a.status === filter)

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "PENDING").length,
    interviewing: applications.filter(a => a.status === "INTERVIEWING").length,
    accepted: applications.filter(a => a.status === "ACCEPTED").length,
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">My Applications</h1>
        <p className="text-sm text-text-muted mb-6">Track your job applications and interview progress</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-border-strong rounded-lg p-4">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{stats.total}</p>
          </div>
          <div className="bg-white border border-border-strong rounded-lg p-4">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Applied</p>
            <p className="text-2xl font-bold text-glassdoor-blue mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white border border-border-strong rounded-lg p-4">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Interviewing</p>
            <p className="text-2xl font-bold text-warning mt-1">{stats.interviewing}</p>
          </div>
          <div className="bg-white border border-border-strong rounded-lg p-4">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Accepted</p>
            <p className="text-2xl font-bold text-glassdoor-green mt-1">{stats.accepted}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {statusFilters.map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === s.key
                  ? "bg-glassdoor-green text-white"
                  : "bg-white border border-border-strong text-text-secondary hover:bg-surface"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="bg-white border border-border-strong rounded-lg p-12 text-center">
            <div className="text-text-muted">Loading applications...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <div key={app.id} className="bg-white border border-border-strong rounded-lg p-5 hover:border-glassdoor-green transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-surface rounded flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-text-muted" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">{app.job.title}</h3>
                      <p className="text-sm text-glassdoor-green font-medium">{app.job.organization.user.name}</p>
                      <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                        <Clock className="h-3 w-3" />
                        <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                {/* Progress Tracker */}
                <div className="mt-4 pt-4 border-t border-surface-alt">
                  <div className="flex items-center gap-2">
                    {["PENDING", "INTERVIEWING", "ACCEPTED"].map((step, idx) => {
                      const stepOrder = ["PENDING", "INTERVIEWING", "ACCEPTED", "REJECTED"]
                      const currentIdx = stepOrder.indexOf(app.status)
                      const stepIdx = stepOrder.indexOf(step)
                      const isCompleted = stepIdx <= currentIdx && app.status !== "REJECTED"
                      const isCurrent = step === app.status
                      const isRejected = app.status === "REJECTED"

                      return (
                        <div key={step} className="flex items-center">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            isRejected && step === "PENDING"
                              ? "bg-danger"
                              : isCompleted
                                ? "bg-glassdoor-green"
                                : isCurrent
                                  ? "bg-glassdoor-green ring-4 ring-glassdoor-green/20"
                                  : "bg-surface-alt"
                          }`} />
                          {idx < 2 && (
                            <div className={`w-8 h-0.5 mx-1 ${
                              isRejected && step === "PENDING"
                                ? "bg-danger"
                                : stepIdx < currentIdx && app.status !== "REJECTED"
                                  ? "bg-glassdoor-green"
                                  : "bg-surface-alt"
                            }`} />
                          )}
                        </div>
                      )
                    })}
                    <span className="text-xs text-text-secondary ml-2 font-medium">
                      {app.status === "REJECTED" ? "Not Selected" : app.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Link href={`/dashboard/applications/${app.id}`}>
                    <Button variant="outline" size="sm" className="rounded border-glassdoor-green text-glassdoor-green hover:bg-glassdoor-green/5 text-xs font-medium">
                      View Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="bg-white border border-border-strong rounded-lg p-12 text-center">
                <FileCheck className="h-12 w-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted text-lg mb-2">No applications found</p>
                <p className="text-text-muted text-sm mb-6">Start applying to jobs to track your progress</p>
                <Link href="/jobs">
                  <Button className="bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold rounded">
                    <Briefcase className="h-4 w-4 mr-2" /> Browse Jobs
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
