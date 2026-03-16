// app/api/tags/route.ts

// ---------------------------------------------
// Next.js API Route
// タグ一覧取得API
// ---------------------------------------------

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------
// GET /api/tags
//
// Tagテーブルからタグ一覧を取得
// ---------------------------------------------
export async function GET() {
  try {

    // -----------------------------------------
    // Tagテーブルから全タグ取得
    //
    // orderByでカテゴリ順 → 名前順に並べる
    // UI表示を安定させるため
    // -----------------------------------------
    const tags = await prisma.tag.findMany({
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    // -----------------------------------------
    // JSONとして返却
    // -----------------------------------------
    return NextResponse.json({
      tags,
    });

  } catch (error) {

    console.error("タグ取得エラー", error);

    // -----------------------------------------
    // エラー時レスポンス
    // -----------------------------------------
    return NextResponse.json(
      { error: "タグ取得に失敗しました" },
      { status: 500 }
    );
  }
}