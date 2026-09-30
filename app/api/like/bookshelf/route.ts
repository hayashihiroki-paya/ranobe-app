// app/api/like/bookshelf/route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { mapBooksToRakutenBooks } from "@/lib/mappers/bookMapper"
import { Prisma } from "@prisma/client"
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth"

type LikeWithBook = Prisma.LikeGetPayload<{
  include: { book: true }
}>

// ---------------------------------------------
// GET /api/like/bookshelf
// 本棚データ取得API
// ---------------------------------------------
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return unauthorizedResponse()

    const likes: LikeWithBook[] = await prisma.like.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: "desc" },
    })

    const books = mapBooksToRakutenBooks(likes.map((like) => like.book))
    return NextResponse.json(books)
  } catch (error) {
    console.error("Bookshelf API Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}