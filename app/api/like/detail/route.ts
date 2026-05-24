// app/api/like/detail/route.ts

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // -----------------------------
    // 認証チェック
    // -----------------------------
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // -----------------------------
    // Like取得（本情報込み）
    // -----------------------------
    const likes = await prisma.like.findMany({
      where: { userId },
      include: {
        book: true
      }
    })

    // -----------------------------
    // Rank取得
    // -----------------------------
    const ranks = await prisma.likeRank.findMany({
      where: { userId }
    })

    // -----------------------------
    // 高速化：Mapに変換
    // -----------------------------
    const rankMap = new Map(
      ranks.map(r => [r.bookId, r.rank])
    )

    // -----------------------------
    // マージ + 整形
    // -----------------------------
    const books = likes.map(like => {
      const rank = rankMap.get(like.bookId) ?? null

      return {
        ...like.book,

        // 👇 UI用
        rank,
        isRanked: rank !== null
      }
    })

    // -----------------------------
    // 並び替え（ランキング優先）
    // -----------------------------
    books.sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank
      if (a.rank) return -1
      if (b.rank) return 1
      return 0
    })

    // -----------------------------
    // レスポンス
    // -----------------------------
    return NextResponse.json(books)

  } catch (err) {
    console.error("LIKE DETAIL API ERROR", err)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}