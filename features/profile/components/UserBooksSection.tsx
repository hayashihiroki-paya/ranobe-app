import { getUserLikedBooks } from "@/lib/api/userBooks";
import BookCardGrid from "@/features/book/components/BookCardGrid";

export default async function UserBooksSection({
  userId,
}: {
  userId: string;
}) {
  const books = await getUserLikedBooks(userId);

  return (
    <div>
      <h2 className="font-bold mb-2">📚 この人の本棚</h2>
      <BookCardGrid books={books} />
    </div>
  );
}