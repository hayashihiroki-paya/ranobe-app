"use client"

import { useEffect, useRef } from "react"
import type { BookDisplay } from "@/types/book"
import BookCardGrid from "./BookCardGrid"
import BookCardGridSkeleton from "./BookCardGridSkeleton"
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
    if (isbn) return

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
  }, [isbn, loadMore])

  return (
    <>
      <BookCardGrid books={books} />

      {loading && <BookCardGridSkeleton />}

      {!isbn && hasMore && (
        <div ref={loadMoreRef} className="h-10" />
      )}

      {error && (
        <p role="alert" className="text-center text-red-600 mt-10">
          {error}
        </p>
      )}

      {!hasMore && !isbn && !error && (
        <p className="text-center text-gray-400 mt-10">
          これ以上の検索結果はありません
        </p>
      )}
    </>
  )
}