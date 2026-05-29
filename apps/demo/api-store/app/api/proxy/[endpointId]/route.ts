import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/generated/client"
import { prisma } from "@/lib/prisma"

const FREE_TRIAL_LIMIT = 50

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

  let freeTrial = await prisma.freeTrial.findUnique({
    where: { userId_endpointId: { userId: user.id, endpointId } },
  })

  const isFree = (freeTrial?.usedCount ?? 0) < FREE_TRIAL_LIMIT
  let costCharged = 0

  if (!isFree) {
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
