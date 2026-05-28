import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const decodedName = decodeURIComponent(params.name)

    const user = await prisma.user.findFirst({
      where: { name: { equals: decodedName, mode: "insensitive" } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        individualProfile: true,
        organizationProfile: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if the requesting user follows this profile
    let isFollowing = false
    if (session?.user?.id && session.user.id !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: user.id,
          },
        },
      })
      isFollowing = !!follow
    }

    return NextResponse.json({ ...user, isFollowing })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
