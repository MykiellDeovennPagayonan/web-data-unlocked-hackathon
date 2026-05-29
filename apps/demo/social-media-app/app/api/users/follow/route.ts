import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { followingId } = body

    if (!followingId) {
      return NextResponse.json(
        { message: "Following ID is required" },
        { status: 400 }
      )
    }

    if (followingId === session.user.id) {
      return NextResponse.json(
        { message: "You cannot follow yourself" },
        { status: 400 }
      )
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        }
      }
    })

    if (existingFollow) {
      return NextResponse.json(
        { message: "Already following this user" },
        { status: 400 }
      )
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId,
      }
    })

    return NextResponse.json(follow, { status: 201 })
  } catch (error) {
    console.error("Error following user:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const followingId = searchParams.get("followingId")

    if (!followingId) {
      return NextResponse.json(
        { message: "Following ID is required" },
        { status: 400 }
      )
    }

    // Delete follow relationship
    const follow = await prisma.follow.deleteMany({
      where: {
        followerId: session.user.id,
        followingId,
      }
    })

    if (follow.count === 0) {
      return NextResponse.json(
        { message: "Not following this user" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Unfollowed successfully" })
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
