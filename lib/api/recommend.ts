// lib/api/recommend.ts

import { prisma } from "@/lib/prisma";

type TagCount = {
  tagId: String;
  count: number;
};

export async function getRecommendBooks(userId: string) {

  // ---------------------------------------------
  // 1. ユーザータグ（回数付き）
  // ---------------------------------------------
  const userTagRaw = await prisma.userBookTag.groupBy({
    by: ["tagId"],
    where: { userId },
    _count: { tagId: true },
  });

  const userTags: TagCount[] = userTagRaw.map(t => ({
    tagId: t.tagId,
    count: t._count.tagId,
  }));

  if (userTags.length === 0) return [];

  const userTotal = userTags.reduce((sum, t) => sum + t.count, 0);

  // ---------------------------------------------
  // 2. Like済み除外
  // ---------------------------------------------
  const likedBooks = await prisma.like.findMany({
    where: { userId },
    select: { bookId: true },
  });

  const likedBookIds = likedBooks.map(b => b.bookId);

  // ---------------------------------------------
  // 3. 本ごとのタグ集計
  // ---------------------------------------------
  const bookTagRaw = await prisma.userBookTag.groupBy({
    by: ["bookId", "tagId"],
    where: {
      bookId: {
        notIn: likedBookIds.length > 0 ? likedBookIds : undefined,
      },
    },
    _count: { tagId: true },
  });

  // ---------------------------------------------
  // 4. bookIdごとにまとめる
  // ---------------------------------------------
  const bookTagMap = new Map<number, TagCount[]>();

  for (const row of bookTagRaw) {
    if (!bookTagMap.has(row.bookId)) {
      bookTagMap.set(row.bookId, []);
    }

    bookTagMap.get(row.bookId)!.push({
      tagId: row.tagId,
      count: row._count.tagId,
    });
  }

  // ---------------------------------------------
  // 5. スコア計算
  // ---------------------------------------------
  const results: {
    bookId: number;
    score: number;
    matchCount: number;
  }[] = [];

  for (const [bookId, bookTags] of bookTagMap.entries()) {

    const bookTotal = bookTags.reduce((sum, t) => sum + t.count, 0);
    if (bookTotal === 0) continue;

    let score = 0;
    let matchCount = 0;

    for (const u of userTags) {
      const b = bookTags.find(bt => bt.tagId === u.tagId);

      if (b) {
        matchCount++;

        const userWeight = u.count / userTotal;
        const bookWeight = b.count / bookTotal;

        score += userWeight * bookWeight;
      }
    }

    if (score > 0) {
      results.push({
        bookId,
        score,
        matchCount,
      });
    }
  }

  // ---------------------------------------------
  // 6. スコア順に並び替え
  // ---------------------------------------------
  results.sort((a, b) => b.score - a.score);

  const top = results.slice(0, 20);

  const bookIds = top.map(r => r.bookId);

  // ---------------------------------------------
  // 7. 本情報取得
  // ---------------------------------------------
  const books = await prisma.book.findMany({
    where: { id: { in: bookIds } },
  });

  const bookMap = new Map<number, (typeof books)[number]>(
    books.map(b => [b.id, b])
  );

  // ---------------------------------------------
  // 8. 整形
  // ---------------------------------------------
  return top.map(r => {
    const book = bookMap.get(r.bookId);

    return {
      bookId: r.bookId,
      isbn: book?.isbn ?? "",
      title: book?.title ?? "",
      author: book?.author ?? "",
      largeImageUrl: book?.largeImageUrl ?? "",

      matchCount: r.matchCount,
      score: Math.round(r.score * 100),
    };
  });
}