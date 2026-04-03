// lib/api/similarUsers.ts
import { prisma } from "@/lib/prisma";

// ---------------------------------------------
// タグMap化
// ---------------------------------------------
function mergeTagMap(
  usage: { tagId: string }[],
  scores: { tagId: string; score: number }[]
) {
  const map: Record<string, number> = {};

  // 行動（回数）
  for (const t of usage) {
    map[t.tagId] = (map[t.tagId] || 0) + 1;
  }

  // 初期スコア
  for (const s of scores) {
    map[s.tagId] = (map[s.tagId] || 0) + s.score;
  }

  return map;
}

// ---------------------------------------------
// cosine類似度 + 安定版
// ---------------------------------------------
function calcSimilarity(
  a: Record<string, number>,
  b: Record<string, number>
) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  let commonCount = 0;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  const allKeys = new Set([...keysA, ...keysB]);

  for (const key of allKeys) {
    const av = a[key] || 0;
    const bv = b[key] || 0;

    if (av > 0 && bv > 0) {
      commonCount++;
      dot += av * bv;
    }

    normA += av * av;
    normB += bv * bv;
  }

  if (normA === 0 || normB === 0) {
    return { score: 0, commonCount: 0 };
  }

  // 🎯 cosine
  let score =
    dot / (Math.sqrt(normA) * Math.sqrt(normB));

  // ---------------------------------
  // 🔥 フィルタ
  // ---------------------------------

  if (commonCount < 2) {
    return { score: 0, commonCount };
  }

  // ---------------------------------
  // 🔥 割合ベースボーナス（安全）
  // ---------------------------------

  const commonRatio =
    commonCount / Math.min(keysA.length, keysB.length);

  score += commonRatio * 0.2;

  // 上限ガード
  score = Math.min(score, 1);

  return { score, commonCount };
}

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