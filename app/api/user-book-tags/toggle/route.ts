// app/api/user-book-tags/toggle/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUserId } from "@/lib/api/auth"
import { toggleUserBookTagSchema } from "@/types/userBookTag"

export async function POST(req: Request) {

  try {

    // --------------------------------------------
    // 認証
    // --------------------------------------------
    const userId = await getAuthenticatedUserId()

    if (!userId) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    // --------------------------------------------
    // body取得
    // --------------------------------------------
    const body = await req.json().catch(() => null)
    const parsedBody = toggleUserBookTagSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "isbn と tagId が必要です" },
        { status: 400 }
      )
    }
    const { isbn, tagId } = parsedBody.data

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

      // 🔥 userTagScore 減点
      await prisma.userTagScore.updateMany({
        where: { userId, tagId },
        data: {
          score: {
            decrement: 1,
          }
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

    await prisma.userTagScore.upsert({
      where: {
        userId_tagId: {
          userId,
          tagId,
        },
      },
      update: {
        score: {
          increment: 1, // 🔥 行動で増やす
        },
      },
      create: {
        userId,
        tagId,
        score: 1,
      },
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