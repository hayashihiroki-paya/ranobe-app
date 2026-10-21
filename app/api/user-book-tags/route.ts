// app/api/user-book-tags/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { userBookTagsQuerySchema } from "@/types/userBookTag";

export async function GET(req: Request) {

  try {

    const userId = await getAuthenticatedUserId();

    if (!userId) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const parsedQuery = userBookTagsQuerySchema.safeParse({
      isbn: searchParams.get("isbn"),
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "isbn が必要です" },
        { status: 400 }
      );
    }
    const { isbn } = parsedQuery.data;

    // --------------------------------------------
    // Book取得
    // --------------------------------------------
    const book = await prisma.book.findUnique({
      where: { isbn },
      select: { id: true }
    });

    // 本がまだDBにない場合
    if (!book) {
      return NextResponse.json([]);
    }

    // --------------------------------------------
    // ユーザータグ取得
    // --------------------------------------------
    const tags = await prisma.userBookTag.findMany({
      where: {
        userId,
        bookId: book.id
      },
      select: {
        tagId: true
      }
    });

    const tagIds = tags.map(t => t.tagId);

    return NextResponse.json(tagIds);

  } catch (error) {

    console.error("UserBookTag取得エラー", error);

    return NextResponse.json(
      { error: "タグ取得失敗" },
      { status: 500 }
    );
  }
}