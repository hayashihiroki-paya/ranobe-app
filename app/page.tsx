// app/page.tsx

import SearchBar from "@/features/search/components/SearchBar";
import Link from "next/link";
import { Suspense } from "react";

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

import TopRecommendContent from "./TopRecommendContent";
import TopRecommendSkeleton from "@/features/book/components/TopRecommendSkeleton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="max-w-7xl mx-auto px-6 py-6 animate-fade-in">
      {/* 検索バー */}
      <Suspense fallback={<div className="h-12 bg-gray-200 animate-pulse rounded" />}>
        <SearchBar />
      </Suspense>

      {/* おすすめ */}
      <section className="mb-10">
        <h2>🔥 あなたへのおすすめ</h2>

        {!session?.user?.id && (
          <p className="text-gray-500">
            ログインするとおすすめが表示されます
          </p>
        )}

        {session?.user?.id && (
          <Suspense fallback={<TopRecommendSkeleton />}>
            <TopRecommendContent userId={session.user.id} />
          </Suspense>
        )}
      </section>

      {/* 更新履歴など追加予定 */}
      <section>
        {/* <h2>📈 人気作品</h2>

        <div className="flex gap-4">
          <Link href="/search">
            <div className="border p-4">仮カード</div>
          </Link>
        </div> */}
      </section>
    </main>
  );
}