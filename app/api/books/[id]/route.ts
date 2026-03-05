// app/api/books/[id]/route.ts

import { deleteBook, updateBook } 
  from "@/features/book/services/bookService"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// 📌 削除
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {

  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  await deleteBook(params.id, session.user.id)

  return NextResponse.json({ success: true })
}

// 📌 更新
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {

  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const body = await req.json()

  const book = await updateBook(
    params.id,
    session.user.id,
    body
  )

  return NextResponse.json(book)
}