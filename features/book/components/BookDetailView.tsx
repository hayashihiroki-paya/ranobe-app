"use client"

import type { RakutenBook } from "@/types/book"
import { useBookRecommendation } from "@/features/book/hooks/useBookRecommendation"
import BookDetailActions from "./BookDetailActions"
import BookDetailHeader from "./BookDetailHeader"
import BookDetailMetadata from "./BookDetailMetadata"
import BookDetailRecommendationPanel from "./BookDetailRecommendationPanel"
import BookDetailSynopsis from "./BookDetailSynopsis"

type Props = {
  book: RakutenBook
  onOpenTagModal: () => void
}

export default function BookDetailView({ book, onOpenTagModal }: Props) {
  const { recommendation, loading, error } = useBookRecommendation(book.isbn)

  return (
    <div className="mx-auto max-w-5xl animate-fade-in p-6">
      <button
        type="button"
        onClick={() => history.back()}
        className="mb-4 text-sm text-blue-600"
      >
        ← 戻る
      </button>

      <BookDetailHeader
        book={book}
        score={recommendation?.score}
        recommendationLoading={loading}
      />
      <BookDetailMetadata book={book} />
      <BookDetailSynopsis synopsis={book.itemCaption} />
      <BookDetailActions book={book} onOpenTagModal={onOpenTagModal} />
      <BookDetailRecommendationPanel
        recommendation={recommendation}
        loading={loading}
        error={error}
      />
    </div>
  )
}
