import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { tl, PLATFORM_ID } from "@/lib/trustlayer"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { targetOrgExternalId, description, severity, category } = body

    if (!targetOrgExternalId || !description) {
      return NextResponse.json(
        { message: "targetOrgExternalId and description are required" },
        { status: 400 }
      )
    }

    // Resolve TrustLayer org from external ID
    let orgId: string | undefined
    try {
      const tlUser = await tl.getPlatformUser(targetOrgExternalId)
      orgId = tlUser.identityId ?? undefined
    } catch {
      // If we can't resolve the org, still submit the report with what we have
    }

    const report = await tl.submitCommunityReport({
      reportingPlatformId: PLATFORM_ID,
      targetType: "organization",
      orgId,
      severity: severity ?? "medium",
      category: category ?? "fraud",
      description,
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("[Reports] error submitting report:", error)
    return NextResponse.json(
      { message: "Failed to submit report" },
      { status: 500 }
    )
  }
}
