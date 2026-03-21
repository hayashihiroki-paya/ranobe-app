// app/recommend/page.tsx

import { getServerSession } from "next-auth";
import BookCardGrid from "@/features/book/components/BookCardGrid";
import { BookDisplay } from "@/types/book";
import { getRecommendBooks } from "@/lib/api/recommend";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function RecommendPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <p className="p-6">ログインしてください</p>;
  }

  // ユーザーにお勧めの本をスコアが高い順に並び変えて取得する
  const books = await getRecommendBooks(session.user.id);

  // ---------------------------------------------
  // 🔥 scoreを保持する
  // ---------------------------------------------
  const displayBooks: BookDisplay[] = books.map((b) => ({
    isbn: b.isbn,
    title: b.title,
    author: b.author,
    largeImageUrl: b.largeImageUrl,
    itemCaption: b.itemCaption,

    // ⭐ ここ追加
    score: b.score,
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">
        あなたへのおすすめ
      </h1>

      {displayBooks.length === 0 && (
        <p className="text-gray-500">
          まだおすすめがありません。タグを付けてみましょう！
        </p>
      )}

      <BookCardGrid books={displayBooks} />
    </div>
  );
}