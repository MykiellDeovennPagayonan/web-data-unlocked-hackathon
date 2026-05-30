import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { tl } from "@/lib/trustlayer"
import { logApiAccess } from "@/lib/access-event"

export async function GET(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1"
    const userAgent = request.headers.get("user-agent") ?? "unknown"

    let verdict: "allowed" | "throttled" | "blocked" = "allowed"

    try {
      const velocity = await tl.trackRequestVelocity(ip)
      if (velocity.isBlacklisted) {
        verdict = "blocked"
        void logApiAccess({ ip, userAgent, verdict })
        return NextResponse.json(
          {
            error: "Access denied",
            message:
              "Your IP address has been flagged for suspicious activity.",
          },
          { status: 403 }
        )
      }
      if (velocity.thresholdExceeded) {
        verdict = "throttled"
        void logApiAccess({ ip, userAgent, verdict })
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message:
              "Too many requests detected from your IP. Access has been restricted.",
          },
          { status: 429 }
        )
      }

      const endpointSignature = `/api/jobs${request.url.split("/api/jobs")[1] ?? ""}`
      await tl.trackIpProbe(ip, endpointSignature)
    } catch {
      // Non-fatal — continue serving if TrustLayer unreachable
    }

    const jobs = await prisma.job.findMany({
      where: { status: "ACTIVE" },
      include: {
        organization: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const response = NextResponse.json(jobs)
    void logApiAccess({ ip, userAgent, verdict })
    return response
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { message: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ORGANIZATION") {
      return NextResponse.json(
        { message: "Unauthorized - Organizations only" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, location, salaryMin, salaryMax, jobType, requirements } = body

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
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

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        jobType: jobType || "FULL_TIME",
        requirements,
        organizationId: orgProfile.id
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

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json(
      { message: "Failed to create job" },
      { status: 500 }
    )
  }
}
