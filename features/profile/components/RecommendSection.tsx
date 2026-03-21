import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRecommendBooks } from "@/lib/api/recommend";
import BookCardGrid from "@/features/book/components/BookCardGrid";

export default async function RecommendSection() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const books = await getRecommendBooks(session.user.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h2 className="font-bold mb-2">🎯 おすすめ作品</h2>
      <BookCardGrid books={books} />
    </div>
  );
}