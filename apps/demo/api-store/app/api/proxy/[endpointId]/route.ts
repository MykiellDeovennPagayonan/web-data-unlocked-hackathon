import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/generated/client"
import { prisma } from "@/lib/prisma"
import { tl, PLATFORM_ID } from "@/lib/trustlayer"
import { FREE_TRIAL_LIMIT } from "@/lib/constants"

export async function POST(
  request: NextRequest,
  { params }: { params: { endpointId: string } }
) {
  return handleProxy(request, params.endpointId)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { endpointId: string } }
) {
  return handleProxy(request, params.endpointId)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { endpointId: string } }
) {
  return handleProxy(request, params.endpointId)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { endpointId: string } }
) {
  return handleProxy(request, params.endpointId)
}

async function handleProxy(request: NextRequest, endpointId: string) {
  const apiKeyHeader = request.headers.get("x-api-key")

  if (!apiKeyHeader) {
    return NextResponse.json(
      { error: "Missing x-api-key header" },
      { status: 401 }
    )
  }

  const apiKeyRecord = await prisma.userApiKey.findUnique({
    where: { key: apiKeyHeader },
    include: { user: true },
  })

  if (!apiKeyRecord) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }

  const endpoint = await prisma.apiEndpoint.findUnique({
    where: { id: endpointId },
    include: {
      orgProfile: true,
    },
  })

  if (!endpoint || !endpoint.isActive) {
    return NextResponse.json({ error: "Endpoint not found or inactive" }, { status: 404 })
  }

  const user = apiKeyRecord.user

  // Get client IP for TrustLayer tracking
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "127.0.0.1"

  let freeLimit = FREE_TRIAL_LIMIT
  let identityId: string | null = null
  let ipId: string | null = null

  // Try to get existing TrustLayer user, or auto-enroll if not found
  let platformUser: { identityId: string | null } | null = null
  try {
    platformUser = await tl.getPlatformUser(user.id)
    console.log(`[PROXY] platformUser for ${user.id}:`, platformUser)
  } catch (err) {
    console.log(`[PROXY] getPlatformUser failed for ${user.id} (user not in TrustLayer), will auto-enroll`)
  }

  if (platformUser?.identityId) {
    // User already enrolled in TrustLayer
    identityId = platformUser.identityId
    const score = await tl.getTrustScore("identity", platformUser.identityId)
    console.log("[PROXY] trust score:", score)
    if (score.score < 15) {
      freeLimit = Math.max(0, score.score)
    }

    // Get IP record for access event logging
    const ipRecord = await tl.lookupIp(ip)
    ipId = ipRecord.id
  } else {
    // AUTO-ENROLL: User exists in API Store but not in TrustLayer
    console.log(`[PROXY] User ${user.id} not enrolled in TrustLayer, auto-enrolling...`)
    try {
      const enrolled = await tl.enrollIndividual({
        email: user.email,
        fullName: user.name || user.email,
        externalUserId: user.id,
      })
      identityId = enrolled.identityId
      console.log(`[PROXY] Auto-enrolled user ${user.id} with identityId: ${identityId}`)
      
      // Now get IP record for the newly enrolled user
      const ipRecord = await tl.lookupIp(ip)
      ipId = ipRecord.id
    } catch (enrollErr) {
      console.error(`[PROXY] Auto-enrollment failed for ${user.id}:`, enrollErr)
    }
  }

  console.log(`[PROXY] identityId: ${identityId}, ipId: ${ipId}, PLATFORM_ID: ${PLATFORM_ID}`)

  let freeTrial = await prisma.freeTrial.findUnique({
    where: { userId_endpointId: { userId: user.id, endpointId } },
  })

  const isFree = (freeTrial?.usedCount ?? 0) < freeLimit
  let costCharged = 0

  if (!isFree) {
    if (freeLimit < FREE_TRIAL_LIMIT) {
      return NextResponse.json(
        { error: "Access denied. Your account has been flagged for suspicious activity." },
        { status: 403 }
      )
    }
    costCharged = endpoint.pricePer1k / 1000
    if (user.creditBalance < costCharged) {
      return NextResponse.json(
        { error: "Insufficient credits", required: costCharged, balance: user.creditBalance },
        { status: 402 }
      )
    }
  }

  let body: string | null = null
  const method = request.method
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await request.text()
    } catch {
      body = null
    }
  }

  const forwardHeaders: Record<string, string> = {}
  const contentType = request.headers.get("content-type")
  if (contentType) forwardHeaders["content-type"] = contentType
  const accept = request.headers.get("accept")
  if (accept) forwardHeaders["accept"] = accept

  let statusCode = 500
  let responseBody: string

  try {
    const upstreamRes = await fetch(endpoint.forwardUrl, {
      method,
      headers: forwardHeaders,
      body: body ?? undefined,
    })
    statusCode = upstreamRes.status
    responseBody = await upstreamRes.text()
  } catch (err) {
    await prisma.apiUsageLog.create({
      data: {
        userId: user.id,
        endpointId,
        apiKeyId: apiKeyRecord.id,
        isFree,
        costCharged: 0,
        statusCode: 0,
      },
    })
    return NextResponse.json({ error: "Failed to reach upstream endpoint" }, { status: 502 })
  }

  // Log access event to TrustLayer for behavioral analysis
  console.log(`[PROXY] Will log access event? identityId=${identityId}, ipId=${ipId}, PLATFORM_ID=${PLATFORM_ID}`)
  if (identityId && ipId && PLATFORM_ID) {
    try {
      await tl.logAccessEvent({
        platformId: PLATFORM_ID,
        identityId,
        ipId,
        eventType: "api_call",
        verdict: statusCode >= 200 && statusCode < 300 ? "allowed" : "throttled",
        scoreAtEvent: freeLimit,
      })
    } catch (err) {
      // Non-fatal — don't block the API call if logging fails
      console.error("[TrustLayer] Failed to log access event:", err)
    }
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (isFree) {
      await tx.freeTrial.upsert({
        where: { userId_endpointId: { userId: user.id, endpointId } },
        update: { usedCount: { increment: 1 } },
        create: { userId: user.id, endpointId, usedCount: 1 },
      })
    } else {
      await tx.user.update({
        where: { id: user.id },
        data: { creditBalance: { decrement: costCharged } },
      })
      await tx.organizationProfile.update({
        where: { id: endpoint.orgProfileId },
        data: { earningsBalance: { increment: costCharged } },
      })
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -costCharged,
          type: "DEDUCTION",
          description: `API call to ${endpoint.name}`,
        },
      })
    }

    await tx.apiUsageLog.create({
      data: {
        userId: user.id,
        endpointId,
        apiKeyId: apiKeyRecord.id,
        isFree,
        costCharged,
        statusCode,
      },
    })
  })

  const contentTypeRes = responseBody.trimStart().startsWith("{") || responseBody.trimStart().startsWith("[")
    ? "application/json"
    : "text/plain"

  return new NextResponse(responseBody, {
    status: statusCode,
    headers: { "content-type": contentTypeRes },
  })
}
