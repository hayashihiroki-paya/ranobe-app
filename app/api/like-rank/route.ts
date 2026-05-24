// app\api\like-rank\route.ts

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { NextResponse } from "next/server"

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
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 }
    )
  }

  const userId = session.user.id

  try {

    // -----------------------------
    // リクエストボディ
    // -----------------------------
    const body: { bookId: number; rank: number }[] = await req.json()

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { message: "配列で送ってください" },
        { status: 400 }
      )
    }

    // -----------------------------
    // バリデーション
    // -----------------------------
    for (const item of body) {
      if (
        typeof item.bookId !== "number" ||
        typeof item.rank !== "number"
      ) {
        return NextResponse.json(
          { message: "bookId / rank は number 必須" },
          { status: 400 }
        )
      }
    }

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

  } catch (err: any) {

    console.error("LIKE RANK PATCH ERROR", err)

    return NextResponse.json(
      { message: "ランキング更新に失敗しました" },
      { status: 500 }
    )
  }
}