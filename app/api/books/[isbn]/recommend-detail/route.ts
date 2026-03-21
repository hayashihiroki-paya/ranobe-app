// app/api/books/[isbn]/recommend-detail/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type TagCount = {
  tagId: string;
  count: number;
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ isbn: string }> }
): Promise<NextResponse> {
  try {
    // ✅ await で unwrap
    const { isbn } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const book = await prisma.book.findUnique({
      where: { isbn },
      select: { id: true }
    });

    if (!book) {
      return NextResponse.json({ error: "Bookが存在しません" }, { status: 404 });
    }

    const bookId = book.id;

    // ユーザータグ集計（嗜好スコア反映）
    const userRaw = await prisma.userTagScore.findMany({
      where: { userId },
      select: { tagId: true, score: true }
    });

    const userTotal = userRaw.reduce((sum, t) => sum + t.score, 0);

    const userTags = userRaw.map(t => ({
      tagId: t.tagId,
      count: t.score // ここを score として扱う
    }));

    // 本タグ
    const bookRaw = await prisma.userBookTag.groupBy({
      by: ["tagId"],
      where: { bookId },
      _count: { tagId: true },
    });
    const bookTags = bookRaw.map(t => ({ tagId: t.tagId, count: t._count.tagId }));
    const bookTotal = bookTags.reduce((sum, t) => sum + t.count, 0);

    // タグ名
    const tagIds = [...new Set([...userTags.map(t => t.tagId), ...bookTags.map(t => t.tagId)])];
    const tags = await prisma.tag.findMany({ where: { id: { in: tagIds } } });
    const tagMap = new Map(tags.map(t => [t.id, t.name]));

    if (userTotal === 0 || bookTotal === 0) {
      return NextResponse.json({
        score: 0,
        matchCount: 0,
        matchedTags: [],
        userTagStats: userTags.map(t => ({ tagId: t.tagId, tagName: tagMap.get(t.tagId) ?? "", count: t.count })),
        bookTagStats: bookTags.map(t => ({ tagId: t.tagId, tagName: tagMap.get(t.tagId) ?? "", count: t.count })),
      });
    }

    // スコア計算
    let score = 0;
    const matchedTags = [];
    for (const u of userTags) {
      const b = bookTags.find(bt => bt.tagId === u.tagId);
      if (b) {
        const userWeight = u.count / userTotal;
        const bookWeight = b.count / bookTotal;
        score += userWeight * bookWeight;
        matchedTags.push({
          tagId: u.tagId,
          tagName: tagMap.get(u.tagId) ?? "",
          userCount: u.count,
          bookCount: b.count,
          userWeight,
          bookWeight,
        });
      }
    }

    matchedTags.sort((a, b) => (b.userCount * b.bookCount) - (a.userCount * a.bookCount));

    return NextResponse.json({
      score: Math.round(score * 100),
      matchCount: matchedTags.length,
      matchedTags,
      userTagStats: userTags.map(t => ({ tagId: t.tagId, tagName: tagMap.get(t.tagId) ?? "", count: t.count })),
      bookTagStats: bookTags.map(t => ({ tagId: t.tagId, tagName: tagMap.get(t.tagId) ?? "", count: t.count })),
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(null, { status: 500 });
  }
}