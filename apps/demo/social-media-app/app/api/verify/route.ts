import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { tl } from "@/lib/trustlayer"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { individualProfile: true },
    })

    if (!user || user.role !== "INDIVIDUAL") {
      return NextResponse.json({ message: "Only individuals can verify" }, { status: 400 })
    }

    // Get or create platform user / identity
    let identityId: string | null = null
    try {
      const platformUser = await tl.getPlatformUser(user.id)
      identityId = platformUser.identityId
    } catch {
      // Not enrolled yet — enroll now
      try {
        const enrolled = await tl.enrollIndividual({
          email: user.email,
          fullName: user.name,
          externalUserId: user.id,
        })
        identityId = enrolled.identityId
      } catch (err) {
        console.error("[TrustLayer] enrollIndividual failed:", err)
        return NextResponse.json({ message: "TrustLayer enrollment failed" }, { status: 500 })
      }
    }

    if (!identityId) {
      return NextResponse.json({ message: "Could not resolve identity" }, { status: 500 })
    }

    const platformId = process.env.TRUSTLAYER_PLATFORM_ID ?? ""
    const baseUrl = process.env.TRUSTLAYER_API_URL ?? "http://localhost:8090"
    const apiKey = process.env.TRUSTLAYER_API_KEY ?? ""

    // 1. Create verification request
    const createRes = await fetch(`${baseUrl}/v1/compliance/verification-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        identityId,
        platformId,
        verificationType: "government_id",
        provider: "manual",
      }),
    })

    if (!createRes.ok) {
      const err = await createRes.json()
      console.error("[TrustLayer] create verification request failed:", err)
      return NextResponse.json({ message: "Verification request failed" }, { status: 500 })
    }

    const verificationRequest = await createRes.json()

    // 2. Auto-approve (demo shortcut)
    const approveRes = await fetch(
      `${baseUrl}/admin/compliance/verification-requests/${verificationRequest.id}/approve`,
      { method: "POST", headers: { "Content-Type": "application/json" } }
    )

    if (!approveRes.ok) {
      const err = await approveRes.json()
      console.error("[TrustLayer] approve verification failed:", err)
      return NextResponse.json({ message: "Approval failed" }, { status: 500 })
    }

    // 3. Run a background check and complete as clean
    const checkRes = await fetch(`${baseUrl}/v1/background-checks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        entityType: "identity",
        identityId,
        triggeredBy: "manual",
      }),
    })

    if (!checkRes.ok) {
      console.error("[TrustLayer] background check creation failed")
      return NextResponse.json({ message: "Background check failed" }, { status: 500 })
    }

    const check = await checkRes.json()

    // Complete the check as clean
    await fetch(`${baseUrl}/v1/background-checks/${check.id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ overallVerdict: "clean" }),
    })

    // 4. Issue certificate
    const certRes = await fetch(`${baseUrl}/v1/trust-certificates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        entityType: "identity",
        identityId,
        issuingCheckId: check.id,
        validDays: 30,
      }),
    })

    if (!certRes.ok) {
      const err = await certRes.json()
      console.error("[TrustLayer] issue certificate failed:", err)
      return NextResponse.json({ message: "Certificate issuance failed" }, { status: 500 })
    }

    const certificate = await certRes.json()

    // 5. Mark user as verified locally
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    })

    return NextResponse.json({
      certificateHash: certificate.certificateHash,
      expiresAt: certificate.expiresAt,
    })
  } catch (error) {
    console.error("[Verify] error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isVerified: true },
    })

    return NextResponse.json({ isVerified: user?.isVerified ?? false })
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
