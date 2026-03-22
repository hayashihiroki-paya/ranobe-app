// lib\api\similarUsers.ts
import { prisma } from "@/lib/prisma";

// タグMap化
function mergeTagMap(
  usage: { tagId: string }[],
  scores: { tagId: string; score: number }[]
) {
  const map: Record<string, number> = {};

  // 行動（回数）
  for (const t of usage) {
    map[t.tagId] = (map[t.tagId] || 0) + 1;
  }

  // 初期スコア（重み）
  for (const s of scores) {
    map[s.tagId] = (map[s.tagId] || 0) + s.score;
  }

  return map;
}

// 類似度
function calcSimilarity(
  a: Record<string, number>,
  b: Record<string, number>
) {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  let minSum = 0;
  let maxSum = 0;

  for (const key of allKeys) {
    const av = a[key] || 0;
    const bv = b[key] || 0;

    minSum += Math.min(av, bv);
    maxSum += Math.max(av, bv);
  }

  if (maxSum === 0) return 0;

  return Math.round((minSum / maxSum) * 100);
}

export async function getSimilarUsers(userId: string) {
  // 🔥 行動データ
  const allTags = await prisma.userBookTag.findMany({
    select: {
      userId: true,
      tagId: true,
    },
  });

  // 🔥 初期スコア
  const allScores = await prisma.userTagScore.findMany({
    select: {
      userId: true,
      tagId: true,
      score: true,
    },
  });

  // ----------------------------
  // ユーザーごとにまとめる
  // ----------------------------

  const userTagMap: Record<string, { tagId: string }[]> = {};
  const userScoreMap: Record<string, { tagId: string; score: number }[]> = {};

  for (const t of allTags) {
    if (!userTagMap[t.userId]) userTagMap[t.userId] = [];
    userTagMap[t.userId].push({ tagId: t.tagId });
  }

  for (const s of allScores) {
    if (!userScoreMap[s.userId]) userScoreMap[s.userId] = [];
    userScoreMap[s.userId].push({
      tagId: s.tagId,
      score: s.score,
    });
  }

  // ----------------------------
  // 自分のベクトル
  // ----------------------------

  const myMap = mergeTagMap(
    userTagMap[userId] || [],
    userScoreMap[userId] || []
  );

  // ユーザー一覧
  const users = await prisma.user.findMany({
    where: {
      NOT: { id: userId },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const result = [];

  for (const user of users) {
    const map = mergeTagMap(
      userTagMap[user.id] || [],
      userScoreMap[user.id] || []
    );

    const score = calcSimilarity(myMap, map);

    if (score === 0) continue;

    // 🔥 上位タグ（合算ベースに変更）
    const tagEntries = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topTagIds = tagEntries.map(([tagId]) => tagId);

    result.push({
      id: user.id,
      name: user.name ?? "ユーザー",
      score,
      topTagIds,
    });
  }

  // タグ名取得
  const allTagIds = [...new Set(result.flatMap((r) => r.topTagIds))];

  const tags = await prisma.tag.findMany({
    where: {
      id: { in: allTagIds },
    },
  });

  const tagNameMap: Record<string, string> = {};
  for (const t of tags) {
    tagNameMap[t.id] = t.name;
  }

  return result
    .map((r) => ({
      id: r.id,
      name: r.name,
      score: r.score,
      tags: r.topTagIds.map((id) => tagNameMap[id] || ""),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}