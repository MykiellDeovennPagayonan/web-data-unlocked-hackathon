import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
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
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
              }
            }
          },
          orderBy: {
            createdAt: "asc"
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

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      )
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "Not authorized to delete this post" },
        { status: 403 }
      )
    }

    await prisma.post.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
