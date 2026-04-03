// app/api/books/[isbn]/recommend-detail/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { buildUserVector } from "@/lib/api/recommend/buildUserVector";
import { calculateScore } from "@/lib/api/recommend/calculateScore";


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ isbn: string }> }
): Promise<NextResponse> {
  try {
    const { isbn } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ---------------------------------------------
    // 本取得
    // ---------------------------------------------
    const book = await prisma.book.findUnique({
      where: { isbn },
      select: { id: true }
    });

    if (!book) {
      return NextResponse.json(null);
    }

    const bookId = book.id;

    // ---------------------------------------------
    // ユーザーベクトル（共通ロジック）
    // ---------------------------------------------
    const userTags = await buildUserVector(userId);

    // ---------------------------------------------
    // 本タグ
    // ---------------------------------------------
    const bookRaw = await prisma.userBookTag.groupBy({
      by: ["tagId"],
      where: { bookId },
      _count: { tagId: true },
    });

    const bookTags = bookRaw.map(t => ({
      tagId: t.tagId,
      count: t._count.tagId
    }));

    // ---------------------------------------------
    // タグ名取得
    // ---------------------------------------------
    const tagIds = [...new Set([
      ...userTags.map(t => t.tagId),
      ...bookTags.map(t => t.tagId)
    ])];

    const tags = await prisma.tag.findMany({
      where: { id: { in: tagIds } }
    });

    const tagMap = new Map(tags.map(t => [t.id, t.name]));

    // ---------------------------------------------
    // スコア計算（🔥統一）
    // ---------------------------------------------
    const result = calculateScore(userTags, bookTags);

    const score = result ? Math.round(result.score * 100) : 0;
    const matchCount = result?.matchCount ?? 0;

    // ---------------------------------------------
    // matchedTags（UI用）
    // ---------------------------------------------
    const matchedTags = [];

    for (const u of userTags) {
      const b = bookTags.find(bt => bt.tagId === u.tagId);

      if (b) {
        matchedTags.push({
          tagId: u.tagId,
          tagName: tagMap.get(u.tagId) ?? "",
          userCount: u.score,
          bookCount: b.count,
          userWeight: u.score,
          bookWeight: b.count,
        });
      }
    }

    // 強い順
    matchedTags.sort(
      (a, b) => (b.userCount * b.bookCount) - (a.userCount * a.bookCount)
    );

    // ---------------------------------------------
    // 統計
    // ---------------------------------------------
    const userTagStats = userTags.map(t => ({
      tagId: t.tagId,
      tagName: tagMap.get(t.tagId) ?? "",
      count: t.score,
    }));

    const bookTagStats = bookTags.map(t => ({
      tagId: t.tagId,
      tagName: tagMap.get(t.tagId) ?? "",
      count: t.count,
    }));

    // ---------------------------------------------
    // レスポンス
    // ---------------------------------------------
    return NextResponse.json({
      score,
      matchCount,
      matchedTags,
      userTagStats,
      bookTagStats,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(null, { status: 500 });
  }
}