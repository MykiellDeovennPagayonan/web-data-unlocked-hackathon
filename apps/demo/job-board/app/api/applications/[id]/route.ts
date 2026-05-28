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
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = params

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            organization: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        individual: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      )
    }

    const isOwner = application.individual.user.id === session.user.id
    const isJobOrganization = application.job.organization.user.id === session.user.id

    if (!isOwner && !isJobOrganization) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { message: "Failed to fetch application" },
      { status: 500 }
    )
  }
}
