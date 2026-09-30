// app/api/wish/route.ts

// =============================================
// Prisma
// DBアクセス用
// =============================================
import { prisma } from "@/lib/prisma"

// =============================================
// NextAuth
// ログインユーザー取得
// =============================================

// =============================================
// Next.js Response
// =============================================
import { NextResponse } from "next/server"

// =============================================
// 型
// =============================================
import { bookInputSchema } from "@/types/book"

// =============================================
// 共通処理
// Book取得 or 作成
// =============================================
import { createOrFindBook } from "@/lib/book/createOrFindBook"

// =============================================
// DB Book → RakutenBook 変換
// =============================================
import { mapBooksToRakutenBooks } from "@/lib/mappers/bookMapper"
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth"



/*
================================================
POST /api/wish
読んでみたい登録
================================================
*/
export async function POST(req: Request) {

  // -------------------------------------------------
  // ログインセッション取得
  // -------------------------------------------------
  const userId = await getAuthenticatedUserId()

  if (!userId) return unauthorizedResponse()

  try {

    // -------------------------------------------------
    // リクエストボディ取得
    // -------------------------------------------------
    const parsedBody = bookInputSchema.safeParse(await req.json())

    // -------------------------------------------------
    // 必須チェック
    // -------------------------------------------------
    if (!parsedBody.success) {
      return NextResponse.json({ message: "isbn / title / author 必須" }, { status: 400 })
    }
    const body = parsedBody.data

    /*
    ============================================
    Transaction開始

    ① Book存在確認
    ② 無ければBook作成
    ③ Wish登録

    → どれか失敗したら全部ロールバック
    ============================================
    */

    const result = await prisma.$transaction(async (tx) => {

      // -------------------------------------------------
      // Book取得 or 作成（共通処理）
      // -------------------------------------------------
      const book = await createOrFindBook(tx, body)

      // -------------------------------------------------
      // Wish登録
      // upsertにより
      // ・既にあれば何もしない
      // ・無ければ作成
      // -------------------------------------------------
      const wish = await tx.wish.upsert({

        where: {
          userId_bookId: {
            userId,
            bookId: book.id
          }
        },

        update: {},

        create: {
          userId,
          bookId: book.id
        }

      })

      return wish

    })

    // -------------------------------------------------
    // 成功レスポンス
    // -------------------------------------------------
    return NextResponse.json({
      success: true,
      wishId: result.id
    })

  } catch (err) {

    console.error("WISH API ERROR", err)

    return NextResponse.json(
      { message: "Wish登録失敗" },
      { status: 500 }
    )

  }

}



/*
================================================
DELETE /api/wish
Wish解除
================================================
*/
export async function DELETE(req: Request) {

  // -------------------------------------------------
  // ログイン確認
  // -------------------------------------------------
  const userId = await getAuthenticatedUserId()

  if (!userId) return unauthorizedResponse()

  try {

    // -------------------------------------------------
    // URLパラメータ取得
    // /api/wish?isbn=xxxx
    // -------------------------------------------------
    const { searchParams } = new URL(req.url)

    const isbn = searchParams.get("isbn")

    if (!isbn) {

      return NextResponse.json(
        { message: "isbn 必須" },
        { status: 400 }
      )

    }

    // -------------------------------------------------
    // Book検索
    // -------------------------------------------------
    const book = await prisma.book.findUnique({
      where: { isbn }
    })

    // 本がDBに存在しない場合
    if (!book) {
      return NextResponse.json({ success: true })
    }

    // -------------------------------------------------
    // Wish削除
    // -------------------------------------------------
    await prisma.wish.delete({

      where: {

        userId_bookId: {
          userId,
          bookId: book.id
        }

      }

    })

    return NextResponse.json({ success: true })

  } catch (err) {

    console.error("WISH DELETE ERROR", err)

    return NextResponse.json(
      { message: "Wish解除失敗" },
      { status: 500 }
    )

  }

}



/*
================================================
GET /api/wish
Wish一覧取得
================================================
*/
export async function GET() {

  // -------------------------------------------------
  // ログインセッション取得
  // -------------------------------------------------
  const userId = await getAuthenticatedUserId()

  if (!userId) return unauthorizedResponse()

  try {

    // -------------------------------------------------
    // Wish取得
    // BookテーブルもJOIN
    // -------------------------------------------------
    const wishes = await prisma.wish.findMany({

      where: {
        userId
      },

      include: {
        book: true
      },

      // 新しい順
      orderBy: {
        createdAt: "desc"
      }

    })

    // -------------------------------------------------
    // DB Book → RakutenBook 変換
    // -------------------------------------------------
    const books = mapBooksToRakutenBooks(
      wishes.map((w) => w.book)
    )

    // -------------------------------------------------
    // JSONレスポンス
    // -------------------------------------------------
    return NextResponse.json(books)

  } catch (err) {

    console.error("WISH GET ERROR", err)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )

  }

}