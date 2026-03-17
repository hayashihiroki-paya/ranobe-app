// app/api/user-book-tags/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {

  try {

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const isbn = searchParams.get("isbn");

    if (!isbn) {
      return NextResponse.json(
        { error: "isbn が必要です" },
        { status: 400 }
      );
    }

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