// app\api\like-rank\route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth"
import { likeRankInputSchema } from "@/types/book"

/*
================================================
PATCH /api/like-rank
ランキング更新（upsert）
================================================
*/

export async function PATCH(req: Request) {

  // -----------------------------
  // 認証チェック
  // -----------------------------
  const userId = await getAuthenticatedUserId()

  if (!userId) return unauthorizedResponse()

  try {

    // -----------------------------
    // リクエストボディ
    // -----------------------------
    const parsedBody = likeRankInputSchema.safeParse(await req.json())

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: "配列で送ってください" },
        { status: 400 }
      )
    }

    const body = parsedBody.data

    /*
      ============================================
      トランザクション開始
      ============================================
    */

    await prisma.$transaction(async (tx) => {

      for (const item of body) {

        // -----------------------------
        // Like存在チェック（任意だけど推奨）
        // -----------------------------
        const like = await tx.like.findUnique({
          where: {
            userId_bookId: {
              userId,
              bookId: item.bookId
            }
          }
        })

        if (!like) {
          throw new Error(`Likeが存在しない bookId: ${item.bookId}`)
        }

        // -----------------------------
        // upsert（更新 or 新規作成）
        // -----------------------------
        await tx.likeRank.upsert({
          where: {
            userId_bookId: {
              userId,
              bookId: item.bookId
            }
          },
          update: {
            rank: item.rank
          },
          create: {
            userId,
            bookId: item.bookId,
            rank: item.rank
          }
        })
      }

    })

    // -----------------------------
    // 成功レスポンス
    // -----------------------------
    return NextResponse.json({
      success: true
    })

  } catch (err: unknown) {

    console.error("LIKE RANK PATCH ERROR", err)

    return NextResponse.json(
      { message: "ランキング更新に失敗しました" },
      { status: 500 }
    )
  }
}