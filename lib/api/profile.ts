// lib\api\profile.ts
import { prisma } from "@/lib/prisma";
import {
  countDistinctUserTags,
  formatUserTagStats,
  rankUserTags,
} from "./profileSupport";

export async function getUserTagStats(userId: string) {
  const [tagUsage, tagScores] = await Promise.all([
    prisma.userBookTag.groupBy({
      by: ["tagId"],
      where: { userId },
      _count: { tagId: true },
    }),
    prisma.userTagScore.findMany({
      where: { userId },
      select: { tagId: true, score: true },
    }),
  ]);

  const rankedTags = rankUserTags(tagUsage, tagScores);

  const tags = await prisma.tag.findMany({
    where: {
      id: { in: rankedTags.map(([tagId]) => tagId) },
    },
  });

  return formatUserTagStats(rankedTags, tags);
}

export async function getUserStats(userId: string) {
  const [likeCount, userTags, scoreTags] = await Promise.all([
    prisma.like.count({
      where: { userId },
    }),
    prisma.userBookTag.findMany({
      where: { userId },
      select: { tagId: true },
    }),
    prisma.userTagScore.findMany({
      where: { userId },
      select: { tagId: true },
    }),
  ]);

  return {
    likeCount,
    tagCount: countDistinctUserTags(userTags, scoreTags),
  };
}