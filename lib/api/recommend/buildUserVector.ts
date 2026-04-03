// lib/recommend/buildUserVector.ts

import { prisma } from "@/lib/prisma";

export async function buildUserVector(userId: string) {
  const userTags = await prisma.userTagScore.findMany({
    where: { userId },
    select: { tagId: true, score: true },
  });

  const likedBooks = await prisma.like.findMany({
    where: { userId },
    select: { bookId: true },
  });

  const likedBookIds = likedBooks.map(b => b.bookId);

  const userTagMap = new Map<string, number>();

  for (const t of userTags) {
    userTagMap.set(t.tagId, t.score);
  }

  if (likedBookIds.length > 0) {
    const likedBookTags = await prisma.bookTag.findMany({
      where: { bookId: { in: likedBookIds } },
      select: { tagId: true, strength: true },
    });

    for (const bt of likedBookTags) {
      const prev = userTagMap.get(bt.tagId) ?? 0;
      userTagMap.set(bt.tagId, prev + bt.strength * 2);
    }
  }

  return Array.from(userTagMap.entries()).map(([tagId, score]) => ({
    tagId,
    score,
  }));
}