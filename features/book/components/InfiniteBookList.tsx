"use client"

import { useEffect, useRef } from "react"
import type { BookDisplay } from "@/types/book"
import BookCardGrid from "./BookCardGrid"
import BookCardGridSkeleton from "./BookCardGridSkeleton"
import SearchApiError from "@/features/search/components/SearchApiError"
import { useInfiniteBookSearch } from "../hooks/useInfiniteBookSearch"

type Props = {
  initialBooks: BookDisplay[]
  keyword: string
  isbn?: string
}

export default function InfiniteBookList({
  initialBooks,
  keyword,
  isbn,
}: Props) {
  const { books, loading, hasMore, error, loadMore } =
    useInfiniteBookSearch({
      initialBooks,
      keyword,
      disabled: Boolean(isbn),
    })
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isbn || error) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { threshold: 0.1 }
    )

    const current = loadMoreRef.current
    if (current) {
      observer.observe(current)
    }
    return () => {
      observer.disconnect()
    }
  }, [error, isbn, loadMore])

  return (
    <>
      <BookCardGrid books={books} />

      {loading && <BookCardGridSkeleton />}

      {books.length === 0 && !loading && !error && (
        <p className="mt-10 text-center text-gray-500">
          検索条件に一致する書籍が見つかりませんでした。
        </p>
      )}

      {!isbn && hasMore && !error && (
        <div ref={loadMoreRef} className="h-10" />
      )}

      {error && <SearchApiError onRetry={loadMore} retrying={loading} />}

      {!hasMore && books.length > 0 && !isbn && !error && (
        <p className="text-center text-gray-400 mt-10">
          これ以上の検索結果はありません
        </p>
      )}
    </>
  )
}
