// lib/batch/recalculateBookTags.ts
// 本ごとに入力されているタグのうち、多いものを本の基礎タグとして登録
// 割合によるスコアもつけておくことでユーザーがlike登録しているときにユーザー嗜好のポイントに反映しておすすめ度を計算する
// 基礎タグによる検索結果などの一覧からソートして表示する機能も追加予定

import { prisma } from "@/lib/prisma"

export async function recalculateBookTags(bookId?: number) {
  const books = bookId
    ? [{ id: bookId }]
    : await prisma.book.findMany({
        select: { id: true }
      })

  let updatedCount = 0

  for (const book of books) {
    // タグ集計
    const tagCounts = await prisma.userBookTag.groupBy({
      by: ["tagId"],
      where: { bookId: book.id },
      _count: { tagId: true },
      orderBy: {
        _count: { tagId: "desc" }
      }
    })

    const total = tagCounts.reduce(
      (sum, t) => sum + t._count.tagId,
      0
    )

    if (total === 0) continue

    const topTags = tagCounts.slice(0, 5)

    // 一旦削除
    await prisma.bookTag.deleteMany({
      where: { bookId: book.id }
    })

    // 再作成
    await prisma.bookTag.createMany({
      data: topTags.map((t) => ({
        bookId: book.id,
        tagId: t.tagId,
        strength: t._count.tagId / total
      }))
    })

    updatedCount++
  }

  return {
    updatedCount,
    totalBooks: books.length
  }
}