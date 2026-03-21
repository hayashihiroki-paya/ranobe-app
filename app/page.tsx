// app/page.tsx

import SearchBar from "@/features/search/components/SearchBar";
import Link from "next/link";
import { Suspense } from "react";

// ⭐ 追加
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { getRecommendBooks } from "@/lib/api/recommend";
import BookCardGrid from "@/features/book/components/BookCardGrid";
import { BookDisplay } from "@/types/book";

export default async function Home() {
  // ⭐ セッション取得
  const session = await getServerSession(authOptions);

  let displayBooks: BookDisplay[] = [];

  if (session?.user?.id) {
    const books = await getRecommendBooks(session.user.id);

    // ⭐ 上位5件だけ
    const topBooks = books.slice(0, 5);

    displayBooks = topBooks.map((b) => ({
      isbn: b.isbn,
      title: b.title,
      author: b.author,
      largeImageUrl: b.largeImageUrl,
      itemCaption: "",
      score: b.score,
    }));
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* 検索バー */}
      <Suspense fallback={<div>Loading...</div>}>
        <SearchBar />
      </Suspense>

      {/* おすすめ */}
      <section style={{ marginBottom: 40 }}>
        <h2>🔥 あなたへのおすすめ</h2>

        {/* ⭐ 未ログイン */}
        {!session?.user?.id && (
          <p style={{ color: "#888" }}>
            ログインするとおすすめが表示されます
          </p>
        )}

        {/* ⭐ データなし */}
        {displayBooks.length === 0 && session?.user?.id && (
          <p style={{ color: "#888" }}>
            まだおすすめがありません
          </p>
        )}

        {/* ⭐ 表示 */}
        {displayBooks.length > 0 && (
          <>
            <BookCardGrid books={displayBooks} />

            {/* ⭐ もっと見る */}
            <div style={{ marginTop: 12 }}>
              <Link href="/recommend" style={{ color: "blue" }}>
                もっと見る →
              </Link>
            </div>
          </>
        )}
      </section>

      {/* 人気作品（今はそのまま） */}
      <section>
        <h2>📈 人気作品</h2>

        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/search">
            <div style={{ border: "1px solid #ddd", padding: 16 }}>
              仮カード
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}