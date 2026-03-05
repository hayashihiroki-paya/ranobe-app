// app/api/like/route.ts


// ---------------------------------------------
// Prisma (DBアクセス)
// ---------------------------------------------
import { prisma } from "@/lib/prisma"


// ---------------------------------------------
// NextAuth (ログインユーザー取得)
// ---------------------------------------------
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"


// ---------------------------------------------
// Next.js APIレスポンス
// ---------------------------------------------
import { NextResponse } from "next/server"


// ---------------------------------------------
// 本の入力型
// 楽天API → DB保存用型
// ---------------------------------------------
import { BookInput } from "@/types/book"


// =============================================
// POST /api/like
// お気に入り登録API
// =============================================
export async function POST(req: Request) {

  // ---------------------------------------------
  // ログインユーザー取得
  // ---------------------------------------------
  const session = await getServerSession(authOptions)

  // 未ログインなら拒否
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }


  // ---------------------------------------------
  // リクエストボディ取得
  // ---------------------------------------------
  const body: BookInput = await req.json()


  // ---------------------------------------------
  // 最低限必要なデータチェック
  // ---------------------------------------------
  if (!body.isbn || !body.title || !body.author) {

    return NextResponse.json(
      { error: "isbn, title, author are required" },
      { status: 400 }
    )
  }


  try {

    // =============================================
    // ① Bookテーブル確認
    // =============================================

    // ISBNで既存の本を検索
    let book = await prisma.book.findUnique({
      where: { isbn: body.isbn }
    })


    // ---------------------------------------------
    // 本がDBに存在しない場合
    // ---------------------------------------------
    if (!book) {

      // Bookテーブルに保存
      book = await prisma.book.create({

        data: {
          isbn: body.isbn,
          title: body.title,
          titleKana: body.titleKana,
          author: body.author,
          authorKana: body.authorKana,
          publisherName: body.publisherName,
          salesDate: body.salesDate,
          seriesName: body.seriesName,
          itemCaption: body.itemCaption,
          largeImageUrl: body.largeImageUrl,
          comment: body.comment
        }
      })
    }


    // =============================================
    // ② Likeテーブル登録
    // =============================================

    /*
      Likeテーブル構造

      userId
      bookId

      同じユーザーが
      同じ本をLikeできないように

      Prisma schema

      @@unique([userId, bookId])

      が設定されている
    */


    const like = await prisma.like.upsert({

      // ---------------------------------------------
      // 複合ユニークキー
      // ---------------------------------------------
      where: {

        userId_bookId: {

          userId: session.user.id,

          bookId: book.id
        }
      },


      // ---------------------------------------------
      // 既に存在する場合
      // ---------------------------------------------
      update: {},

      /*
        updateが空なので

        何もしない

        つまり

        重複登録防止
      */


      // ---------------------------------------------
      // 存在しない場合
      // ---------------------------------------------
      create: {

        userId: session.user.id,

        bookId: book.id
      }
    })


    // ---------------------------------------------
    // 成功レスポンス
    // ---------------------------------------------
    return NextResponse.json({ like })


  } catch (err: any) {

    // ---------------------------------------------
    // エラー処理
    // ---------------------------------------------
    console.error(err)

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}