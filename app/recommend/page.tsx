// app/recommend/page.tsx

import { getServerSession } from "next-auth";
import { Suspense } from "react";
import { authOptions } from "../api/auth/[...nextauth]/route";

import RecommendContent from "./RecommendContent";
import BookCardGridSkeleton from "@/features/book/components/BookCardGridSkeleton";

export default async function RecommendPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <p className="p-6">ログインしてください</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">
        あなたへのおすすめ
      </h1>

      <Suspense fallback={<BookCardGridSkeleton />}>
        <RecommendContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}