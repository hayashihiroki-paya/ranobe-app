// lib/api/recommend.ts

import { prisma } from "@/lib/prisma";

type TagScore = {
  tagId: string;
  score: number;
};

type TagCount = {
  tagId: string;
  count: number;
};

export async function getRecommendBooks(userId: string) {

  // ---------------------------------------------
  // 1. ユーザータグ（元データ）
  // ---------------------------------------------
  const userTags = await prisma.userTagScore.findMany({
    where: { userId },
    select: {
      tagId: true,
      score: true,
    },
  });

  // ---------------------------------------------
  // 2. Like済み取得
  // ---------------------------------------------
  const likedBooks = await prisma.like.findMany({
    where: { userId },
    select: { bookId: true },
  });

  const likedBookIds = likedBooks.map(b => b.bookId);

  // ---------------------------------------------
  // 3. userTag + like本BookTag を合算（ここが追加）
  // ---------------------------------------------
  const userTagMap = new Map<string, number>();

  // 3-1. userTagScore
  for (const t of userTags) {
    userTagMap.set(t.tagId, t.score);
  }

  // 3-2. like本の基礎タグ取得
  if (likedBookIds.length > 0) {
    const likedBookTags = await prisma.bookTag.findMany({
      where: {
        bookId: { in: likedBookIds },
      },
      select: {
        tagId: true,
        strength: true,
      },
    });

    // 3-3. 加算
    for (const bt of likedBookTags) {
      const prev = userTagMap.get(bt.tagId) ?? 0;
      userTagMap.set(bt.tagId, prev + bt.strength);
    }
  }

  // 3-4. 配列化
  const mergedUserTags: TagScore[] = Array.from(userTagMap.entries()).map(
    ([tagId, score]) => ({
      tagId,
      score,
    })
  );

  if (mergedUserTags.length === 0) return [];

  const userTotal = mergedUserTags.reduce(
    (sum, t) => sum + t.score,
    0
  );

  // ---------------------------------------------
  // 4. 本タグ（userBookTag集計：元のまま）
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
  // 5. bookIdごとにまとめる
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
  // 6. スコア計算
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

    for (const u of mergedUserTags) {
      const b = bookTags.find(bt => bt.tagId === u.tagId);

      if (b) {
        matchCount++;

        const userWeight = u.score / userTotal;
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
  // 7. ソート
  // ---------------------------------------------
  results.sort((a, b) => b.score - a.score);

  const top = results.slice(0, 20);
  const bookIds = top.map(r => r.bookId);

  // ---------------------------------------------
  // 8. 本情報取得
  // ---------------------------------------------
  const books = await prisma.book.findMany({
    where: { id: { in: bookIds } },
  });

  const bookMap = new Map<number, (typeof books)[number]>(
    books.map(b => [b.id, b])
  );

  // ---------------------------------------------
  // 9. 整形
  // ---------------------------------------------
  return top.map(r => {
    const book = bookMap.get(r.bookId);

    return {
      bookId: r.bookId,
      isbn: book?.isbn ?? "",
      title: book?.title ?? "",
      author: book?.author ?? "",
      largeImageUrl: book?.largeImageUrl ?? "",
      itemCaption: book?.itemCaption ?? "",

      matchCount: r.matchCount,
      score: Math.round(r.score * 100),
    };
  });
}