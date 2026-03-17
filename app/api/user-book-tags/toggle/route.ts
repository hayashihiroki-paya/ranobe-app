// app/api/user-book-tags/toggle/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

type ToggleBody = {
  isbn: string
  tagId: string
}

export async function POST(req: Request) {

  try {

    // --------------------------------------------
    // 認証
    // --------------------------------------------
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // --------------------------------------------
    // body取得
    // --------------------------------------------
    const body = (await req.json()) as ToggleBody
    const { isbn, tagId } = body

    if (!isbn || !tagId) {
      return NextResponse.json(
        { error: "isbn と tagId が必要です" },
        { status: 400 }
      )
    }

    // --------------------------------------------
    // Book取得
    // --------------------------------------------
    const book = await prisma.book.findUnique({
      where: { isbn },
      select: { id: true }
    })

    if (!book) {
      return NextResponse.json(
        { error: "Bookが存在しません（Likeされていない可能性）" },
        { status: 404 }
      )
    }

    const bookId = book.id

    // --------------------------------------------
    // 既存タグ確認
    // --------------------------------------------
    const existing = await prisma.userBookTag.findFirst({
      where: {
        userId,
        bookId,
        tagId
      }
    })

    // --------------------------------------------
    // 削除
    // --------------------------------------------
    if (existing) {

      await prisma.userBookTag.delete({
        where: {
          id: existing.id
        }
      })

      return NextResponse.json({
        status: "removed"
      })
    }

    // --------------------------------------------
    // 追加
    // --------------------------------------------
    await prisma.userBookTag.create({
      data: {
        userId,
        bookId,
        tagId,
        score: 1
      }
    })

    return NextResponse.json({
      status: "added"
    })

  } catch (error) {

    console.error("タグトグルエラー", error)

    return NextResponse.json(
      { error: "タグ操作に失敗しました" },
      { status: 500 }
    )
  }
}