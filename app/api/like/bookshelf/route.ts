// app/api/like/bookshelf/route.ts

// ---------------------------------------------
// Prisma
// DBアクセス用（Likeテーブルなどを操作）
// ---------------------------------------------
import { prisma } from "@/lib/prisma"

// ---------------------------------------------
// NextAuth
// ログインセッション取得
// ---------------------------------------------
import { getServerSession } from "next-auth"

// ---------------------------------------------
// NextAuth設定
// ---------------------------------------------
import { authOptions } from "../../auth/[...nextauth]/route"

// ---------------------------------------------
// Next.js Response
// ---------------------------------------------
import { NextResponse } from "next/server"

// ---------------------------------------------
// DB Book → RakutenBook 変換
// ---------------------------------------------
import { mapBooksToRakutenBooks } from "@/lib/mappers/bookMapper"

// 型指定エラー回避用
import { Prisma } from "@prisma/client"

type LikeWithBook = Prisma.LikeGetPayload<{
  include: { book: true }
}>

// ---------------------------------------------
// GET /api/like/bookshelf
// 本棚データ取得API
// ---------------------------------------------
export async function GET() {

  try {

    // -------------------------------------------------
    // ログインユーザーのセッション取得
    // -------------------------------------------------
    const session = await getServerSession(authOptions)

    // -------------------------------------------------
    // 未ログインの場合
    // -------------------------------------------------
    if (!session?.user?.id) {

      // 401 = 認証エラー
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )

    }

    // -------------------------------------------------
    // Likeテーブルからお気に入り取得
    // -------------------------------------------------
    const likes: LikeWithBook[] = await prisma.like.findMany({

      // 自分のLikeのみ取得
      where: {
        userId: session.user.id
      },

      // BookテーブルもJOIN取得
      include: {
        book: true
      },

      // 新しいお気に入り順
      orderBy: {
        createdAt: "desc"
      }

    })

    // -------------------------------------------------
    // DB Book → RakutenBook 型に変換
    //
    // likes の構造
    // [
    //   { id, userId, bookId, book: {...Book} }
    // ]
    //
    // bookだけ取り出してMapperへ渡す
    // -------------------------------------------------
    const books = mapBooksToRakutenBooks(
      likes.map((l) => l.book)
    )

    // -------------------------------------------------
    // JSONとして返す
    // -------------------------------------------------
    return NextResponse.json(books)

  } catch (err) {

    // -------------------------------------------------
    // サーバーエラー
    // -------------------------------------------------
    console.error("Bookshelf API Error:", err)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )

  }

}