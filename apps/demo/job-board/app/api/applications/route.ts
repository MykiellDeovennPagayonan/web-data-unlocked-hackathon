import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { tl } from "@/lib/trustlayer"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "INDIVIDUAL") {
      return NextResponse.json(
        { message: "Unauthorized - Individuals only" },
        { status: 403 }
      )
    }

    const individual = await prisma.individualProfile.findFirst({
      where: { user: { id: session.user.id } }
    })

    if (!individual) {
      return NextResponse.json(
        { message: "Individual profile not found" },
        { status: 404 }
      )
    }

    const applications = await prisma.application.findMany({
      where: { individualId: individual.id },
      include: {
        job: {
          include: {
            organization: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { appliedAt: "desc" }
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { message: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "INDIVIDUAL") {
      return NextResponse.json(
        { message: "Unauthorized - Individuals only" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jobId, coverLetter, expectedSalary, availability, resumeUrl } = body

    if (!jobId || !resumeUrl) {
      return NextResponse.json(
        { message: "Job ID and resume URL are required" },
        { status: 400 }
      )
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      )
    }

    if (job.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "This job is no longer accepting applications" },
        { status: 400 }
      )
    }

    const individual = await prisma.individualProfile.findFirst({
      where: { user: { id: session.user.id } }
    })

    if (!individual) {
      return NextResponse.json(
        { message: "Individual profile not found" },
        { status: 404 }
      )
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_individualId: {
          jobId,
          individualId: individual.id
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { message: "You have already applied to this job" },
        { status: 400 }
      )
    }

    // Step 10: Trust gate — check identity score before allowing application
    try {
      const tlUser = await tl.getPlatformUser(session.user.id)
      if (tlUser.identityId) {
        const score = await tl.getTrustScore("identity", tlUser.identityId)
        if (score.score < 30) {
          return NextResponse.json(
            {
              message:
                "Your account has been flagged for suspicious activity. You have been throttled from submitting applications. Please contact support.",
              trustScore: score.score,
            },
            { status: 429 }
          )
        }
      }
    } catch {
      // Non-fatal — allow application if TrustLayer is unreachable
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        individualId: individual.id,
        coverLetter,
        expectedSalary: expectedSalary ? parseInt(expectedSalary) : null,
        availability,
        resumeUrl
      },
      include: {
        job: {
          include: {
            organization: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      { message: "Failed to submit application" },
      { status: 500 }
    )
  }
}
