import type { RakutenBook } from "@/types/book"

type Props = {
  book: RakutenBook
  score?: number
  recommendationLoading: boolean
}

export default function BookDetailHeader({
  book,
  score,
  recommendationLoading,
}: Props) {
  return (
    <div className="flex items-start justify-between border-b pb-3">
      <div>
        <h1 className="text-2xl font-bold">{book.title}</h1>
        <p className="text-sm text-gray-500">{book.seriesName}</p>
      </div>

      <div className="font-semibold text-orange-500">
        {recommendationLoading ? "..." : `一致度 ${score ?? 0}%`}
      </div>
    </div>
  )
}
