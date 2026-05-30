import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FREE_TRIAL_LIMIT } from "@/lib/constants"

export async function GET(
  request: NextRequest,
  { params }: { params: { endpointId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { endpointId } = params

  const freeTrial = await prisma.freeTrial.findUnique({
    where: { userId_endpointId: { userId: session.user.id, endpointId } },
  })

  const usedCount = freeTrial?.usedCount ?? 0

  return NextResponse.json({ usedCount, freeLimit: FREE_TRIAL_LIMIT })
}
