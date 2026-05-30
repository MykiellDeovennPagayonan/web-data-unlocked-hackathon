import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { tl } from "@/lib/trustlayer"
import { TunaiError } from "@trust-layer/tunai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, ...profileData } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        ...(role === "INDIVIDUAL" && {
          individualProfile: {
            create: {
              bio: profileData.bio,
              location: profileData.location,
              website: profileData.website,
            }
          }
        }),
        ...(role === "ORGANIZATION" && {
          organizationProfile: {
            create: {
              domain: profileData.domain,
              linkedin: profileData.linkedin,
              regNumber: profileData.regNumber,
              address: profileData.address,
              description: profileData.description,
            }
          }
        })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
      }
    })

    if (role === "INDIVIDUAL") {
      const certificateHash = profileData.certificateHash as string | undefined
      if (certificateHash) {
        try {
          const result = await tl.verifyCertificate(certificateHash, process.env.TRUSTLAYER_PLATFORM_ID ?? "")
          if (result.valid && result.entityType === "identity") {
            await prisma.user.update({
              where: { id: user.id },
              data: { isVerified: true },
            })
          } else {
            await prisma.user.delete({ where: { id: user.id } })
            return NextResponse.json(
              { message: "Invalid or expired certificate." },
              { status: 400 }
            )
          }
        } catch (tlErr) {
          console.error("[TrustLayer] certificate verification failed:", tlErr)
          await prisma.user.delete({ where: { id: user.id } })
          return NextResponse.json(
            { message: "Certificate verification failed. Please try again." },
            { status: 400 }
          )
        }
      } else {
        const deviceSignals = (profileData.deviceFingerprint as Array<{ signalType: string; value: string }> | undefined) ?? []
        try {
          const enrolled = await tl.enrollIndividual({
            email,
            fullName: name,
            externalUserId: user.id,
          })
          if (deviceSignals.length > 0) {
            await tl.resolveDevice(
              deviceSignals.map((s) => ({
                signalType: s.signalType as "canvas_hash" | "webgl_hash" | "screen_resolution" | "os" | "timezone" | "user_agent" | "language",
                value: s.value,
              })),
              enrolled.identityId
            )
          }
        } catch (tlErr) {
          // Handle hard blocks from TrustLayer (e.g. suspicious email domain or pattern)
          if (tlErr instanceof TunaiError && tlErr.status === 403) {
            await prisma.user.delete({ where: { id: user.id } })
            return NextResponse.json(
              { message: tlErr.cleanMessage },
              { status: 403 }
            )
          }
          console.error("[TrustLayer] registerUser failed (non-fatal):", tlErr)
        }

        // Hard block if trust score drops below threshold
        try {
          const platformUser = await tl.getPlatformUser(user.id)
          if (platformUser.identityId) {
            const score = await tl.getTrustScore("identity", platformUser.identityId)
            if (score.score < 10) {
              await prisma.user.delete({ where: { id: user.id } })
              return NextResponse.json(
                { message: "You have been flagged for suspicious activity." },
                { status: 403 }
              )
            }
          }
        } catch (err) {
          console.error("[TrustLayer] Hard block check failed:", err)
        }
      }
    }

    if (role === "ORGANIZATION") {
      try {
        const org = await tl.enrollOrganization({
          legalName: name,
          domain: profileData.domain ?? "",
          registrationNumber: profileData.regNumber ?? "",
          country: "US",
          industry: "general",
          externalUserId: user.id,
        })

        const check = await tl.runBackgroundCheck({
          entityType: "organization",
          orgId: org.orgId,
          triggeredBy: "registration",
          entityName: name,
        })

        if (check.overallVerdict === "blocked") {
          await prisma.user.delete({ where: { id: user.id } })
          return NextResponse.json(
            {
              message:
                "Your organization could not be verified. It appears on sanctions or fraud lists. Please contact support.",
              verdict: check.overallVerdict,
            },
            { status: 403 }
          )
        }

        if (check.overallVerdict === "flagged") {
          await prisma.user.delete({ where: { id: user.id } })
          return NextResponse.json(
            {
              message:
                "Your organization could not be verified. No credible web presence was found. Please contact support.",
              verdict: check.overallVerdict,
            },
            { status: 403 }
          )
        }
      } catch (tlErr) {
        console.error("[TrustLayer] org registration/background check failed:", tlErr)
      }
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
