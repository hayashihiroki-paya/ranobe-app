// lib/api/similarUsers.ts
import { prisma } from "@/lib/prisma";
import { calcSimilarity, mergeTagMap } from "./similarUsersSupport";

// ---------------------------------------------
// メイン処理
// ---------------------------------------------
export async function getSimilarUsers(userId: string) {
  const allTags = await prisma.userBookTag.findMany({
    select: {
      userId: true,
      tagId: true,
    },
  });

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
  const userScoreMap: Record<
    string,
    { tagId: string; score: number }[]
  > = {};

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
  // 自分
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

    const { score, commonCount } = calcSimilarity(
      myMap,
      map
    );

    // 🔥 弱すぎるの除外
    if (score < 0.1) continue;

    // 上位タグ
    const tagEntries = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topTagIds = tagEntries.map(([tagId]) => tagId);

    result.push({
      id: user.id,
      name: user.name ?? "ユーザー",
      score,
      commonCount,
      topTagIds,
    });
  }

  // ---------------------------------------------
  // タグ名取得
  // ---------------------------------------------
  const allTagIds = [
    ...new Set(result.flatMap((r) => r.topTagIds)),
  ];

  const tags = await prisma.tag.findMany({
    where: {
      id: { in: allTagIds },
    },
  });

  const tagNameMap: Record<string, string> = {};
  for (const t of tags) {
    tagNameMap[t.id] = t.name;
  }

  // ---------------------------------------------
  // 最終整形
  // ---------------------------------------------
  return result
    .map((r) => ({
      id: r.id,
      name: r.name,
      score: Math.round(r.score * 100),
      tags: r.topTagIds.map(
        (id) => tagNameMap[id] || ""
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// チューニングするならここ
// commonCount < 2   // 厳しさ調整
// score < 0.1       // 足切り
// commonCount * 0.03 // 一致強化
// + commonCount * 2 // 表示ブースト