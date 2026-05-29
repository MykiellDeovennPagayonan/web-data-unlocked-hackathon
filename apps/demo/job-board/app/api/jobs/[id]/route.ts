import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    })

    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json(
      { message: "Failed to fetch job" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ORGANIZATION") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()

    const orgProfile = await prisma.organizationProfile.findFirst({
      where: { user: { id: session.user.id } }
    })

    if (!orgProfile) {
      return NextResponse.json(
        { message: "Organization profile not found" },
        { status: 404 }
      )
    }

    const existingJob = await prisma.job.findFirst({
      where: { id, organizationId: orgProfile.id }
    })

    if (!existingJob) {
      return NextResponse.json(
        { message: "Job not found or unauthorized" },
        { status: 404 }
      )
    }

    const { title, description, location, salaryMin, salaryMax, jobType, requirements, status } = body

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(location !== undefined && { location }),
        ...(salaryMin !== undefined && { salaryMin: parseInt(salaryMin) }),
        ...(salaryMax !== undefined && { salaryMax: parseInt(salaryMax) }),
        ...(jobType && { jobType }),
        ...(requirements !== undefined && { requirements }),
        ...(status && { status })
      },
      include: {
        organization: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json(
      { message: "Failed to update job" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ORGANIZATION") {
      return NextResponse.json(
        { message: "Unauthorized" },
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

    const existingJob = await prisma.job.findFirst({
      where: { id, organizationId: orgProfile.id }
    })

    if (!existingJob) {
      return NextResponse.json(
        { message: "Job not found or unauthorized" },
        { status: 404 }
      )
    }

    await prisma.job.update({
      where: { id },
      data: { status: "CLOSED" }
    })

    return NextResponse.json({ message: "Job closed successfully" })
  } catch (error) {
    console.error("Error closing job:", error)
    return NextResponse.json(
      { message: "Failed to close job" },
      { status: 500 }
    )
  }
}
