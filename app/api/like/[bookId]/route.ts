// app/api/like/[bookId]/route.ts

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// =====================================================
// DELETE /api/like/[bookId]
// 指定された Book の Like を削除
// =====================================================
export async function DELETE(
  req: Request,
  context: { params: Promise<{ bookId: string }> } // 🔹 params は Promise になる
) {
  const session = await getServerSession(authOptions)

  // 🔥 未ログインは拒否
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 🔹 params を await でアンラップ
  const { bookId } = await context.params
  const bookIdNum = Number(bookId)

  // 🔹 Like テーブルから削除
  await prisma.like.delete({
    where: {
      userId_bookId: {
        userId: session.user.id,
        bookId: bookIdNum,
      },
    },
  })

  return Response.json({ success: true })
}