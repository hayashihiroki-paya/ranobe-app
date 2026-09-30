// lib/api/similarUsers.ts
import { prisma } from "@/lib/prisma";
import {
  formatSimilarUsers,
  groupUserTags,
  rankSimilarUsers,
} from "./similarUsersSupport";

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

  const userTags = groupUserTags(allTags, allScores);

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

  const candidates = rankSimilarUsers(userId, users, userTags);

  // ---------------------------------------------
  // タグ名取得
  // ---------------------------------------------
  const allTagIds = [...new Set(candidates.flatMap((candidate) => candidate.topTagIds))];

  const tags = await prisma.tag.findMany({
    where: {
      id: { in: allTagIds },
    },
  });

  return formatSimilarUsers(candidates, tags);
}

// チューニングするならここ
// commonCount < 2   // 厳しさ調整
// score < 0.1       // 足切り
// commonCount * 0.03 // 一致強化
// + commonCount * 2 // 表示ブースト