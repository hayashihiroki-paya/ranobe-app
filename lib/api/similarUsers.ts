import { prisma } from "@/lib/prisma";

// タグMap化
function toTagMap(tags: { tagId: string }[]) {
  const map: Record<string, number> = {};

  for (const t of tags) {
    map[t.tagId] = (map[t.tagId] || 0) + 1;
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
  // 🔥 全ユーザーのタグを一発取得
  const allTags = await prisma.userBookTag.findMany({
    select: {
      userId: true,
      tagId: true,
    },
  });

  // 🔥 ユーザーごとにまとめる
  const userTagMap: Record<string, { tagId: string }[]> = {};

  for (const t of allTags) {
    if (!userTagMap[t.userId]) {
      userTagMap[t.userId] = [];
    }
    userTagMap[t.userId].push({ tagId: t.tagId });
  }

  // 自分のタグ
  const myTags = userTagMap[userId] || [];
  const myMap = toTagMap(myTags);

  // ユーザー情報まとめて取得
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
    const tags = userTagMap[user.id] || [];

    const map = toTagMap(tags);
    const score = calcSimilarity(myMap, map);

    if (score === 0) continue;

    // 🔥 上位タグ（メモリで計算）
    const tagCount: Record<string, number> = {};
    for (const t of tags) {
      tagCount[t.tagId] = (tagCount[t.tagId] || 0) + 1;
    }

    const topTagIds = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tagId]) => tagId);

    result.push({
      id: user.id,
      name: user.name ?? "ユーザー",
      score,
      topTagIds,
    });
  }

  // タグ名をまとめて取得（1回）
  const allTagIds = [...new Set(result.flatMap((r) => r.topTagIds))];

  const tagMap = await prisma.tag.findMany({
    where: {
      id: { in: allTagIds },
    },
  });

  const tagNameMap: Record<string, string> = {};
  for (const t of tagMap) {
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