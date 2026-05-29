import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const endpoints = await prisma.apiEndpoint.findMany({
    where: { isActive: true },
    include: {
      orgProfile: {
        select: { userId: true, user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(endpoints)
}

export async function POST(request: NextRequest) {
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

  const body = await request.json()
  const { name, description, forwardUrl, method, samplePayload, sampleResponse, pricePer1k } = body

  if (!name || !forwardUrl) {
    return NextResponse.json({ message: "name and forwardUrl are required" }, { status: 400 })
  }

  const validMethods = ["GET", "POST", "PUT", "DELETE"]
  const httpMethod = validMethods.includes(method) ? method : "POST"

  const endpoint = await prisma.apiEndpoint.create({
    data: {
      orgProfileId: orgProfile.id,
      name,
      description,
      forwardUrl,
      method: httpMethod,
      samplePayload,
      sampleResponse,
      pricePer1k: pricePer1k ?? 1.0,
    },
  })

  return NextResponse.json(endpoint, { status: 201 })
}
