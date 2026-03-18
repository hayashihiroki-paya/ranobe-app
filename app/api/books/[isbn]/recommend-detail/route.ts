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
) {
  try {
    const {isbn} = await context.params;
    console.log(isbn);
    // ---------------------------------------------
    // 1. ログインユーザー取得
    // ---------------------------------------------
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(null, { status: 401 });
    }

    const userId = session.user.id;
    // --------------------------------------------
    // Book取得
    // --------------------------------------------

    const book = await prisma.book.findUnique({
      where: { isbn },
      select: { id: true }
    })

    if (!book) {
      return NextResponse.json(
        { error: "Bookが存在しません（Likeされていない可能性）" },
        { status: 404 }
      )
    }

    const bookId = book.id
    

    // ---------------------------------------------
    // 2. ユーザータグ集計
    // ---------------------------------------------
    const userRaw = await prisma.userBookTag.groupBy({
      by: ["tagId"],
      where: { userId },
      _count: { tagId: true },
    });

    const userTags: TagCount[] = userRaw.map(t => ({
      tagId: t.tagId,
      count: t._count.tagId,
    }));

    const userTotal = userTags.reduce((sum, t) => sum + t.count, 0);

    // ---------------------------------------------
    // 3. 本タグ集計
    // ---------------------------------------------
    const bookRaw = await prisma.userBookTag.groupBy({
      by: ["tagId"],
      where: { bookId },
      _count: { tagId: true },
    });

    const bookTags: TagCount[] = bookRaw.map(t => ({
      tagId: t.tagId,
      count: t._count.tagId,
    }));

    const bookTotal = bookTags.reduce((sum, t) => sum + t.count, 0);

    if (userTotal === 0 || bookTotal === 0) {
      return NextResponse.json({
        score: 0,
        matchCount: 0,
        matchedTags: [],
        userTagStats: userTags,
        bookTagStats: bookTags,
      });
    }

    // ---------------------------------------------
    // 4. タグマスタ取得（名前用）
    // ---------------------------------------------
    const tagIds = [
      ...new Set([
        ...userTags.map(t => t.tagId),
        ...bookTags.map(t => t.tagId),
      ]),
    ];

    const tags = await prisma.tag.findMany({
      where: { id: { in: tagIds } },
    });

    const tagMap = new Map(tags.map(t => [t.id, t.name]));

    // ---------------------------------------------
    // 5. スコア計算 + マッチタグ生成
    // ---------------------------------------------
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

    // ---------------------------------------------
    // 6. ソート（重要度順）
    // ---------------------------------------------
    matchedTags.sort(
      (a, b) => (b.userWeight * b.bookWeight) - (a.userWeight * a.bookWeight)
    );

    // ---------------------------------------------
    // 7. 整形して返す
    // ---------------------------------------------
    return NextResponse.json({
      score: Math.round(score * 100),
      matchCount: matchedTags.length,

      matchedTags,

      userTagStats: userTags.map(t => ({
        tagId: t.tagId,
        tagName: tagMap.get(t.tagId) ?? "",
        count: t.count,
      })),

      bookTagStats: bookTags.map(t => ({
        tagId: t.tagId,
        tagName: tagMap.get(t.tagId) ?? "",
        count: t.count,
      })),
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(null, { status: 500 });
  }
}