import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const authorId = searchParams.get("authorId") ?? undefined
    const skip = (page - 1) * limit

    const where = authorId ? { authorId } : {}

    const posts = await prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          }
        }
      }
    })

    const total = await prisma.post.count({ where })

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

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
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          }
        }
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
