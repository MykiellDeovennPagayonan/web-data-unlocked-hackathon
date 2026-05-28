import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ORGANIZATION") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const orgProfile = await prisma.organizationProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, earningsBalance: true },
  })

  if (!orgProfile) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  const endpoints = await prisma.apiEndpoint.findMany({
    where: { orgProfileId: orgProfile.id },
    include: {
      usageLogs: {
        select: { isFree: true, costCharged: true, createdAt: true, userId: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const endpointStats = endpoints.map((ep) => {
    const totalCalls = ep.usageLogs.length
    const freeCalls = ep.usageLogs.filter((l) => l.isFree).length
    const paidCalls = totalCalls - freeCalls
    const totalEarned = ep.usageLogs.reduce((sum, l) => sum + l.costCharged, 0)
    return {
      id: ep.id,
      name: ep.name,
      description: ep.description,
      pricePer1k: ep.pricePer1k,
      isActive: ep.isActive,
      createdAt: ep.createdAt,
      totalCalls,
      freeCalls,
      paidCalls,
      totalEarned,
      recentActivity: ep.usageLogs.slice(0, 10),
    }
  })

  return NextResponse.json({
    earningsBalance: orgProfile.earningsBalance,
    endpoints: endpointStats,
  })
}
