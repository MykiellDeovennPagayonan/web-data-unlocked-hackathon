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
  })

  if (!orgProfile) {
    return NextResponse.json({ message: "Organization profile not found" }, { status: 404 })
  }

  const endpoints = await prisma.apiEndpoint.findMany({
    where: { orgProfileId: orgProfile.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(endpoints)
}
