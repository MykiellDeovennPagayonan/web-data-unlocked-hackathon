import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ORGANIZATION") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const orgProfile = await prisma.organizationProfile.findUnique({
    where: { userId: session.user.id },
  })

  const endpoint = await prisma.apiEndpoint.findFirst({
    where: { id: params.id, orgProfileId: orgProfile?.id },
  })

  if (!endpoint) {
    return NextResponse.json({ message: "Endpoint not found" }, { status: 404 })
  }

  const body = await request.json()
  const { name, description, forwardUrl, method, samplePayload, sampleResponse, pricePer1k, isActive } = body

  const validMethods = ["GET", "POST", "PUT", "DELETE"]
  const httpMethod = method !== undefined && validMethods.includes(method) ? method : undefined

  const updated = await prisma.apiEndpoint.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(forwardUrl !== undefined && { forwardUrl }),
      ...(httpMethod !== undefined && { method: httpMethod }),
      ...(samplePayload !== undefined && { samplePayload }),
      ...(sampleResponse !== undefined && { sampleResponse }),
      ...(pricePer1k !== undefined && { pricePer1k }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ORGANIZATION") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const orgProfile = await prisma.organizationProfile.findUnique({
    where: { userId: session.user.id },
  })

  const endpoint = await prisma.apiEndpoint.findFirst({
    where: { id: params.id, orgProfileId: orgProfile?.id },
  })

  if (!endpoint) {
    return NextResponse.json({ message: "Endpoint not found" }, { status: 404 })
  }

  await prisma.apiEndpoint.delete({ where: { id: params.id } })

  return NextResponse.json({ message: "Deleted" })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = await prisma.apiEndpoint.findUnique({
    where: { id: params.id },
    include: {
      orgProfile: {
        select: { userId: true, user: { select: { name: true } } },
      },
    },
  })

  if (!endpoint) {
    return NextResponse.json({ message: "Endpoint not found" }, { status: 404 })
  }

  return NextResponse.json(endpoint)
}
