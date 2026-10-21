// app/api/like/detail/route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth"

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return unauthorizedResponse()

    const likes = await prisma.like.findMany({
      where: { userId },
      include: { book: true },
    })

    const ranks = await prisma.likeRank.findMany({
      where: { userId },
    })

    const rankMap = new Map(ranks.map((rank) => [rank.bookId, rank.rank]))

    const books = likes.map((like) => {
      const rank = rankMap.get(like.bookId) ?? null

      return {
        ...like.book,
        rank,
        isRanked: rank !== null,
      }
    })

    books.sort((a, b) => {
      if (a.rank !== null && b.rank !== null) return a.rank - b.rank
      if (a.rank !== null) return -1
      if (b.rank !== null) return 1
      return 0
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error("LIKE DETAIL API ERROR", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}