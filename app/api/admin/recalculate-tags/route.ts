// app/api/admin/recalculate-tags/route.ts

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { recalculateBookTags } from "@/lib/batch/recalculateBookTags"

export async function POST(req: Request) {
  try {
    // セッション取得
    const session = await getServerSession(authOptions)

    // 未ログイン
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 管理者チェック（メール）
    if (session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // body取得（任意）
    const body = await req.json().catch(() => null)
    const bookId = body?.bookId

    // 実行
    const result = await recalculateBookTags(bookId)

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error("タグ再計算エラー:", error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}