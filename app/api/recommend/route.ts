// app/api/recommend/route.ts

import { getRecommendBooks } from "@/lib/api/recommend/getRecommendBooks";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return unauthorizedResponse();

    const recommendations = await getRecommendBooks(userId);
    return Response.json(recommendations);
  } catch (error) {
    console.error("RECOMMEND_API_ERROR:", error);

    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}