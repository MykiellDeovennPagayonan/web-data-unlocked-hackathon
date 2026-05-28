"use client"

import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: "PENDING" | "INTERVIEWING" | "ACCEPTED" | "REJECTED"
}

const statusConfig = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  INTERVIEWING: { label: "Interviewing", className: "bg-blue-100 text-blue-800" },
  ACCEPTED: { label: "Accepted", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800" }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge className={config.className}>{config.label}</Badge>
}
