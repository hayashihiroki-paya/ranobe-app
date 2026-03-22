// lib\api\profile.ts
import { prisma } from "@/lib/prisma";

export async function getUserTagStats(userId: string) {
  // ① ユーザー行動ログ（回数）
  const tagUsage = await prisma.userBookTag.groupBy({
    by: ["tagId"],
    where: { userId },
    _count: { tagId: true },
  });

  // ② 初期スコア
  const tagScores = await prisma.userTagScore.findMany({
    where: { userId },
  });

  // ③ マージ用Map
  const tagMap = new Map<string, number>();

  // 回数を加算
  tagUsage.forEach((t) => {
    tagMap.set(t.tagId, t._count.tagId);
  });

  // スコアを加算（既存あれば足す）
  tagScores.forEach((s) => {
    const current = tagMap.get(s.tagId) ?? 0;
    tagMap.set(s.tagId, current + s.score);
  });

  // ④ ソートしてTOP5
  const sorted = Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // ⑤ tag情報取得
  const tags = await prisma.tag.findMany({
    where: {
      id: { in: sorted.map(([tagId]) => tagId) },
    },
  });

  // ⑥ 整形
  return sorted.map(([tagId, score]) => {
    const tag = tags.find((t) => t.id === tagId);
    return {
      name: tag?.name ?? "不明",
      count: score,
    };
  });
}

export async function getUserStats(userId: string) {
  const likeCount = await prisma.like.count({
    where: { userId },
  });

  // ① userBookTagのtagId
  const userTags = await prisma.userBookTag.findMany({
    where: { userId },
    select: { tagId: true },
  });

  // ② UserTagScoreのtagId
  const scoreTags = await prisma.userTagScore.findMany({
    where: { userId },
    select: { tagId: true },
  });

  // ③ ユニーク化
  const tagSet = new Set<string>();

  userTags.forEach((t) => tagSet.add(t.tagId));
  scoreTags.forEach((t) => tagSet.add(t.tagId));

  const tagCount = tagSet.size;

  return {
    likeCount,
    tagCount,
  };
}