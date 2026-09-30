// app/api/user-book-tags/toggle/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth"
import { toggleUserBookTagSchema } from "@/types/userBookTag"

export async function POST(req: Request) {

  try {

    // --------------------------------------------
    // 認証
    // --------------------------------------------
    const userId = await getAuthenticatedUserId()

    if (!userId) return unauthorizedResponse()

    // --------------------------------------------
    // body取得
    // --------------------------------------------
    const parsedBody = toggleUserBookTagSchema.safeParse(await req.json())

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
    const status = await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({
        where: { isbn },
        select: { id: true },
      })

      if (!book) return null

      const existing = await tx.userBookTag.findFirst({
        where: { userId, bookId: book.id, tagId },
      })

      if (existing) {
        await tx.userBookTag.delete({ where: { id: existing.id } })
        await tx.userTagScore.updateMany({
          where: { userId, tagId },
          data: { score: { decrement: 1 } },
        })
        return "removed" as const
      }

      await tx.userBookTag.create({
        data: { userId, bookId: book.id, tagId, score: 1 },
      })
      await tx.userTagScore.upsert({
        where: { userId_tagId: { userId, tagId } },
        update: { score: { increment: 1 } },
        create: { userId, tagId, score: 1 },
      })
      return "added" as const
    })

    if (!status) {
      return NextResponse.json(
        { error: "Bookが存在しません（Likeされていない可能性）" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status
    })

  } catch (error) {

    console.error("タグトグルエラー", error)

    return NextResponse.json(
      { error: "タグ操作に失敗しました" },
      { status: 500 }
    )
  }
}