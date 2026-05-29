import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const logs = await prisma.apiUsageLog.findMany({
    where: { userId: session.user.id },
    include: {
      endpoint: {
        select: { name: true, pricePer1k: true, orgProfile: { select: { user: { select: { name: true } } } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const byEndpoint: Record<string, {
    endpointId: string
    endpointName: string
    orgName: string
    totalCalls: number
    freeCalls: number
    paidCalls: number
    totalSpent: number
  }> = {}

  for (const log of logs) {
    if (!byEndpoint[log.endpointId]) {
      byEndpoint[log.endpointId] = {
        endpointId: log.endpointId,
        endpointName: log.endpoint.name,
        orgName: log.endpoint.orgProfile.user.name,
        totalCalls: 0,
        freeCalls: 0,
        paidCalls: 0,
        totalSpent: 0,
      }
    }
    byEndpoint[log.endpointId].totalCalls++
    if (log.isFree) {
      byEndpoint[log.endpointId].freeCalls++
    } else {
      byEndpoint[log.endpointId].paidCalls++
      byEndpoint[log.endpointId].totalSpent += log.costCharged
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { creditBalance: true },
  })

  return NextResponse.json({
    creditBalance: user?.creditBalance ?? 0,
    byEndpoint: Object.values(byEndpoint),
    recentLogs: logs.slice(0, 20),
  })
}
