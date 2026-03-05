// app/api/books/route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { bookInputSchema } from "@/types/book"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// 📌 保存（POST）
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // 🔥 未ログインは拒否
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const result = bookInputSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: "入力内容が不正です",
          details: result.error.flatten(),
        },
        { status: 400 }
      )
    }

    const book = await prisma.book.create({
      data: {
        ...result.data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(book, { status: 201 })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}

// 📌 取得（GET）
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // 🔥 未ログインは拒否
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const books = await prisma.book.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(books)

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "取得に失敗しました" },
      { status: 500 }
    )
  }
}