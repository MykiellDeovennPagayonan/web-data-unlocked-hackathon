import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { creditBalance: true },
  })

  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ balance: user?.creditBalance ?? 0, transactions })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const amount = Number(body.amount)

  if (!amount || amount <= 0) {
    return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
  }

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { creditBalance: { increment: amount } },
      select: { creditBalance: true },
    }),
    prisma.creditTransaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "TOPUP",
        description: `Top-up of $${amount.toFixed(2)}`,
      },
    }),
  ])

  return NextResponse.json({ balance: user.creditBalance })
}
