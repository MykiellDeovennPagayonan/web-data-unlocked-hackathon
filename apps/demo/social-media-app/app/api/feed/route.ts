import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    let posts
    let total

    if (session?.user?.id) {
      // Authenticated: show posts from followed users + own posts
      const followedUsers = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      })
      const followedIds = followedUsers.map((f) => f.followingId)
      const feedUserIds = [...followedIds, session.user.id]

      posts = await prisma.post.findMany({
        where: { authorId: { in: feedUserIds } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              isVerified: true,
            },
          },
          likes: {
            where: { userId: session.user.id },
            select: { userId: true },
          },
          _count: {
            select: { comments: true, likes: true },
          },
        },
      })

      total = await prisma.post.count({
        where: { authorId: { in: feedUserIds } },
      })
    } else {
      // Unauthenticated: show all public posts
      posts = await prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              isVerified: true,
            },
          },
          likes: { select: { userId: true } },
          _count: {
            select: { comments: true, likes: true },
          },
        },
      })

      total = await prisma.post.count()
    }

    // Normalize: add isLiked flag
    const normalizedPosts = posts.map((post) => ({
      ...post,
      isLiked: session?.user?.id
        ? post.likes.some((l) => l.userId === session.user.id)
        : false,
      likes: undefined,
    }))

    return NextResponse.json({
      posts: normalizedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching feed:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
