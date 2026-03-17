// app/api/tags/route.ts

// --------------------------------------------
// NextResponse
// APIレスポンス用
// --------------------------------------------
import { NextResponse } from "next/server";

// --------------------------------------------
// Prisma
// DBアクセス
// --------------------------------------------
import { prisma } from "@/lib/prisma";

// --------------------------------------------
// GET /api/tags
// タグ一覧取得API
// --------------------------------------------
export async function GET() {
  try {

    // --------------------------------------------
    // Tagテーブルから全タグ取得
    // usageCountが多い順で並べる
    // --------------------------------------------
    const tags = await prisma.tag.findMany({
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    // --------------------------------------------
    // JSONとして返す
    // --------------------------------------------
    return NextResponse.json(tags);

  } catch (error) {

    console.error("Tag取得エラー", error);

    return NextResponse.json(
      { error: "タグ取得に失敗しました" },
      { status: 500 }
    );
  }
}