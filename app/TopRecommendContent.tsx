// app/TopRecommendContent.tsx

import { getRecommendBooks } from "@/lib/api/recommend";
import BookCardGrid from "@/features/book/components/BookCardGrid";
import { BookDisplay } from "@/types/book";
import Link from "next/link";

export default async function TopRecommendContent({
  userId,
}: {
  userId: string;
}) {
  const books = await getRecommendBooks(userId);

  const topBooks = books.slice(0, 5);

  const displayBooks: BookDisplay[] = topBooks.map((b) => ({
    isbn: b.isbn,
    title: b.title,
    author: b.author,
    largeImageUrl: b.largeImageUrl,
    itemCaption: "",
    score: b.score,
  }));

  if (displayBooks.length === 0) {
    return (
      <p className="text-gray-500">
        まだおすすめがありません
      </p>
    );
  }

  return (
    <>
      <BookCardGrid books={displayBooks} />

      <div className="mt-3">
        <Link href="/recommend" className="text-blue-500">
          もっと見る →
        </Link>
      </div>
    </>
  );
}