import BookCardGrid from "@/features/book/components/BookCardGrid"
import { getRecommendBooks } from "@/lib/api/recommend/getRecommendBooks"

export default async function RecommendSection({ userId }: { userId: string }) {
  const books = await getRecommendBooks(userId)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h2 className="font-bold mb-2">🎯 おすすめ作品</h2>
      <BookCardGrid books={books} />
    </div>
  )
}
