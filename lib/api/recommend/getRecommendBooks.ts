// lib/recommend/getRecommendBooks.ts

import { prisma } from "@/lib/prisma";
import { buildUserVector } from "./buildUserVector";
import { buildBookVectors } from "./buildBookVectors";
import { calculateScore } from "./calculateScore";

export async function getRecommendBooks(userId: string) {
  // ---------------------------------------------
  // 1. ユーザーベクトル
  // ---------------------------------------------
  const userTags = await buildUserVector(userId);
  if (userTags.length === 0) return [];

  // ---------------------------------------------
  // 2. Like取得（除外用）
  // ---------------------------------------------
  const likedBooks = await prisma.like.findMany({
    where: { userId },
    select: { bookId: true },
  });

  const likedBookIds = likedBooks.map(b => b.bookId);

  // ---------------------------------------------
  // 3. 本ベクトル
  // ---------------------------------------------
  const bookTagMap = await buildBookVectors(likedBookIds);

  // ---------------------------------------------
  // 4. スコア計算
  // ---------------------------------------------
  const results: {
    bookId: number;
    score: number;
    matchCount: number;
  }[] = [];

  for (const [bookId, bookTags] of bookTagMap.entries()) {
    const result = calculateScore(userTags, bookTags);

    if (!result) continue;

    results.push({
      bookId,
      score: result.score,
      matchCount: result.matchCount,
    });
  }

  // ---------------------------------------------
  // 5. ソート
  // ---------------------------------------------
  results.sort((a, b) => b.score - a.score);

  const top = results.slice(0, 20);
  const bookIds = top.map(r => r.bookId);

  // ---------------------------------------------
  // 6. 本情報取得
  // ---------------------------------------------
  const books = await prisma.book.findMany({
    where: { id: { in: bookIds } },
  });

  const bookMap = new Map<number, (typeof books)[number]>(
    books.map(b => [b.id, b])
  );

  // ---------------------------------------------
  // 7. 整形
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

      // UI用
      score: Math.round(r.score * 100),
    };
  });
}