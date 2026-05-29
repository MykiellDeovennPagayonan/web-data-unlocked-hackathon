"use client"

import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: "PENDING" | "INTERVIEWING" | "ACCEPTED" | "REJECTED"
}

const statusConfig = {
  PENDING: { label: "Applied", className: "bg-glassdoor-blue/10 text-glassdoor-blue border-0 rounded" },
  INTERVIEWING: { label: "Interviewing", className: "bg-warning/10 text-warning border-0 rounded" },
  ACCEPTED: { label: "Accepted", className: "bg-glassdoor-green/10 text-glassdoor-green border-0 rounded" },
  REJECTED: { label: "Not Selected", className: "bg-danger/10 text-danger border-0 rounded" }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge className={config.className}>{config.label}</Badge>
}
