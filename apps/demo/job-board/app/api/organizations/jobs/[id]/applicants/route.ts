import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ORGANIZATION") {
      return NextResponse.json(
        { message: "Unauthorized - Organizations only" },
        { status: 403 }
      )
    }

    const { id } = params

    const orgProfile = await prisma.organizationProfile.findFirst({
      where: { user: { id: session.user.id } }
    })

    if (!orgProfile) {
      return NextResponse.json(
        { message: "Organization profile not found" },
        { status: 404 }
      )
    }

    const job = await prisma.job.findFirst({
      where: { id, organizationId: orgProfile.id }
    })

    if (!job) {
      return NextResponse.json(
        { message: "Job not found or unauthorized" },
        { status: 404 }
      )
    }

    const applications = await prisma.application.findMany({
      where: { jobId: id },
      include: {
        individual: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { appliedAt: "desc" }
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applicants:", error)
    return NextResponse.json(
      { message: "Failed to fetch applicants" },
      { status: 500 }
    )
  }
}
