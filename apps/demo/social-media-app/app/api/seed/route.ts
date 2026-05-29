import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const SEED_SECRET = process.env.SEED_SECRET || "dev-seed-secret"

interface SeedUser {
  name: string
  email: string
  password: string
  posts: string[]
}

export async function POST(request: NextRequest) {
  // Security: require secret token
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  if (token !== SEED_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const users: SeedUser[] = body.users || []

    const createdUsers = []

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12)

      // Upsert user (create or update if email exists)
      const dbUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          password: hashedPassword,
        },
        create: {
          email: user.email,
          password: hashedPassword,
          name: user.name,
          role: "INDIVIDUAL",
          individualProfile: {
            create: {
              bio: "Seeded test user",
              location: "Test City",
              website: "https://example.com",
            },
          },
        },
      })

      // Create posts
      for (const content of user.posts) {
        await prisma.post.create({
          data: {
            content,
            authorId: dbUser.id,
          },
        })
      }

      createdUsers.push({ id: dbUser.id, email: dbUser.email, name: dbUser.name })
    }

    return NextResponse.json(
      { message: "Seed complete", users: createdUsers },
      { status: 201 }
    )
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { message: "Seed failed", error: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  // Security: require secret token
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  if (token !== SEED_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    // Delete all data for e2e test users
    const e2eUsers = await prisma.user.findMany({
      where: { email: { endsWith: "@e2e.local" } },
      select: { id: true },
    })

    const userIds = e2eUsers.map((u) => u.id)

    // Delete in dependency order
    await prisma.comment.deleteMany({
      where: { authorId: { in: userIds } },
    })
    await prisma.like.deleteMany({
      where: { userId: { in: userIds } },
    })
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: { in: userIds } },
          { followingId: { in: userIds } },
        ],
      },
    })
    await prisma.post.deleteMany({
      where: { authorId: { in: userIds } },
    })
    await prisma.individualProfile.deleteMany({
      where: { userId: { in: userIds } },
    })
    await prisma.organizationProfile.deleteMany({
      where: { userId: { in: userIds } },
    })
    const deleted = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    })

    return NextResponse.json(
      { message: "Cleanup complete", deleted: deleted.count },
      { status: 200 }
    )
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json(
      { message: "Cleanup failed", error: String(error) },
      { status: 500 }
    )
  }
}
