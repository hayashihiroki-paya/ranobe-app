// app/api/recommend/route.ts

// ---------------------------------------------
// NextAuth（ログインユーザー取得）
// ---------------------------------------------
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// ---------------------------------------------
// レコメンドロジック（共通化した関数）
// ---------------------------------------------
import { getRecommendBooks } from "@/lib/api/recommend";

// ---------------------------------------------
// GET /api/recommend
// ---------------------------------------------
export async function GET() {
  try {
    // ---------------------------------------------
    // 1. セッション取得（ログインチェック）
    // ---------------------------------------------
    const session = await getServerSession(authOptions);

    // 未ログインなら401
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // ---------------------------------------------
    // 2. レコメンド取得（共通ロジック呼び出し）
    // ---------------------------------------------
    const recommendations = await getRecommendBooks(userId);

    // ---------------------------------------------
    // 3. レスポンス返却
    // ---------------------------------------------
    return Response.json(recommendations);

  } catch (error) {
    // ---------------------------------------------
    // エラーログ
    // ---------------------------------------------
    console.error("RECOMMEND_API_ERROR:", error);

    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}