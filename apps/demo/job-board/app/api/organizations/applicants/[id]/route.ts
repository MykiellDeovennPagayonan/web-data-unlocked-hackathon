import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
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
    const body = await request.json()
    const { status } = body

    if (!status || !["PENDING", "INTERVIEWING", "ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
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

    const application = await prisma.application.findFirst({
      where: { id },
      include: {
        job: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      )
    }

    if (application.job.organizationId !== orgProfile.id) {
      return NextResponse.json(
        { message: "Unauthorized - Not your job posting" },
        { status: 403 }
      )
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        individual: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        job: {
          select: { title: true }
        }
      }
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json(
      { message: "Failed to update application status" },
      { status: 500 }
    )
  }
}
