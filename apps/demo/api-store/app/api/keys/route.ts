import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const apiKey = await prisma.userApiKey.findUnique({
    where: { userId: session.user.id },
  })

  return NextResponse.json(apiKey)
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const newKey = `ask_${randomBytes(24).toString("hex")}`

  const apiKey = await prisma.userApiKey.upsert({
    where: { userId: session.user.id },
    update: { key: newKey },
    create: { userId: session.user.id, key: newKey },
  })

  return NextResponse.json(apiKey, { status: 201 })
}
