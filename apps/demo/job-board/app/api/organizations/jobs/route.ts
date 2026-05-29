import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ORGANIZATION") {
      return NextResponse.json(
        { message: "Unauthorized - Organizations only" },
        { status: 403 }
      )
    }

    const orgProfile = await prisma.organizationProfile.findFirst({
      where: { user: { id: session.user.id } }
    })

    if (!orgProfile) {
      return NextResponse.json(
        { message: "Organization profile not found" },
        { status: 404 }
      )
    }

    const jobs = await prisma.job.findMany({
      where: { organizationId: orgProfile.id },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching organization jobs:", error)
    return NextResponse.json(
      { message: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}
