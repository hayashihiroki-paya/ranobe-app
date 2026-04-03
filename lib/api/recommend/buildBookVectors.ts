// lib/recommend/buildBookVectors.ts

import { prisma } from "@/lib/prisma";

type TagCount = {
  tagId: string;
  count: number;
};

export async function buildBookVectors(excludeBookIds: number[]) {
  const bookTagRaw = await prisma.userBookTag.groupBy({
    by: ["bookId", "tagId"],
    where: {
      bookId: {
        notIn: excludeBookIds.length > 0 ? excludeBookIds : undefined,
      },
    },
    _count: { tagId: true },
  });

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

  return bookTagMap;
}