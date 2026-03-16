// app/api/like/route.ts

// =============================================
// Prisma (DBアクセス)
// =============================================
import { prisma } from "@/lib/prisma"

// =============================================
// NextAuth (ログインユーザー取得)
// =============================================
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

// =============================================
// Next.js APIレスポンス
// =============================================
import { NextResponse } from "next/server"

// =============================================
// 本の入力型
// =============================================
import { BookInput } from "@/types/book"
import { createOrFindBook } from "@/lib/book/createOrFindBook"



/*
================================================
POST /api/like
お気に入り登録
================================================
*/

export async function POST(req: Request) {

  // ---------------------------------------------
  // セッション取得
  // ---------------------------------------------
  const session = await getServerSession(authOptions)

  // 未ログイン拒否
  if (!session?.user?.id) {

    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 }
    )

  }

  try {

    // ---------------------------------------------
    // リクエストボディ
    // ---------------------------------------------
    const body: BookInput = await req.json()

    // ---------------------------------------------
    // 必須項目チェック
    // ---------------------------------------------
    if (!body.isbn || !body.title || !body.author) {

      return NextResponse.json(
        { message: "isbn / title / author 必須" },
        { status: 400 }
      )

    }

    /*
      ============================================
      transaction開始
      ============================================

      Book作成
      Like作成

      をまとめて実行
    */

    const result = await prisma.$transaction(async (tx) => {

      /*
        ============================================
        Bookテーブル確認
        ============================================
      */

      const book = await createOrFindBook(tx, body)


      /*
        ============================================
        Like登録
        ============================================

        schema.prisma

        @@unique([userId, bookId])

        により

        同一ユーザー
        同一本

        は1回しかLikeできない
      */

      const like = await tx.like.upsert({

        where: {

          userId_bookId: {

            userId: session.user.id,
            bookId: book.id

          }

        },

        /*
          既にLikeしている場合

          update空なので
          何もしない
        */
        update: {},

        /*
          未登録なら新規Like
        */
        create: {

          userId: session.user.id,
          bookId: book.id

        }

      })


      return like

    })


    /*
      成功レスポンス

      UI側では
      DBデータ全部は不要なので

      最小限だけ返す
    */

    return NextResponse.json({

      success: true,
      likeId: result.id

    })


  } catch (err: any) {

    console.error("LIKE API ERROR", err)

    return NextResponse.json(
      { message: "お気に入り登録に失敗しました" },
      { status: 500 }
    )

  }

}



/*
================================================
DELETE /api/like
お気に入り解除
================================================
*/

export async function DELETE(req: Request) {

  // ---------------------------------------------
  // セッション取得
  // ---------------------------------------------
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {

    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 }
    )

  }

  try {

    /*
      URLクエリ取得

      /api/like?isbn=XXXX
    */

    const { searchParams } = new URL(req.url)

    const isbn = searchParams.get("isbn")

    if (!isbn) {

      return NextResponse.json(
        { message: "isbn 必須" },
        { status: 400 }
      )

    }

    /*
      本を検索
    */

    const book = await prisma.book.findUnique({

      where: { isbn }

    })

    if (!book) {

      return NextResponse.json({
        success: true
      })

    }

    /*
      ============================================
      Like削除
      ============================================

      @@unique([userId, bookId])

      を使うので

      deleteManyではなく
      deleteが使える
    */

    await prisma.like.delete({

      where: {

        userId_bookId: {

          userId: session.user.id,
          bookId: book.id

        }

      }

    })


    return NextResponse.json({

      success: true

    })


  } catch (err) {

    console.error("UNLIKE API ERROR", err)

    return NextResponse.json(
      { message: "お気に入り解除失敗" },
      { status: 500 }
    )

  }

}



/*
================================================
GET /api/like
ログインユーザーのお気に入りISBN一覧取得
================================================
*/

export async function GET() {

  try {

    // ---------------------------------------------
    // ログインユーザー取得
    // ---------------------------------------------
    const session = await getServerSession(authOptions)

    // 未ログイン
    if (!session?.user?.id) {

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )

    }

    // ---------------------------------------------
    // Like取得
    // ---------------------------------------------
    const likes = await prisma.like.findMany({

      // 自分のLikeのみ
      where: {
        userId: session.user.id
      },

      // BookのISBNのみ取得
      include: {
        book: {
          select: {
            isbn: true
          }
        }
      }

    })

    // ---------------------------------------------
    // ISBN配列に変換
    // ---------------------------------------------
    const isbns = likes.map((like) => like.book.isbn)

    // ---------------------------------------------
    // レスポンス
    // ---------------------------------------------
    return NextResponse.json(isbns)

  } catch (err) {

    console.error(err)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )

  }

}