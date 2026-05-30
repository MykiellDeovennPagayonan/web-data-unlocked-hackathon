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

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
