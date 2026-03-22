// app/recommend/RecommendContent.tsx

import BookCardGrid from "@/features/book/components/BookCardGrid";
import { getRecommendBooks } from "@/lib/api/recommend";
import { BookDisplay } from "@/types/book";

export default async function RecommendContent({
  userId,
}: {
  userId: string;
}) {
  const books = await getRecommendBooks(userId);

  const displayBooks: BookDisplay[] = books.map((b) => ({
    isbn: b.isbn,
    title: b.title,
    author: b.author,
    largeImageUrl: b.largeImageUrl,
    itemCaption: b.itemCaption,
    score: b.score,
  }));

  if (displayBooks.length === 0) {
    return (
      <p className="text-gray-500">
        まだおすすめがありません。タグを付けてみましょう！
      </p>
    );
  }

  return <BookCardGrid books={displayBooks} />;
}