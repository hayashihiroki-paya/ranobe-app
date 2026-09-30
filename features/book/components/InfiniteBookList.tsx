"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BookDisplay } from "@/types/book"
import BookCardGrid from "./BookCardGrid"
import BookSkeletonGrid from "./BookSkeletonGrid"

type Props = {
  initialBooks: BookDisplay[]
  keyword: string
  isbn?: string // ★追加
}

export default function InfiniteBookList({
  initialBooks,
  keyword,
  isbn
}: Props) {

  const [books, setBooks] = useState(initialBooks)
  const [page, setPage] = useState(2)
  const [loading, setLoading] = useState(false)

  // ★ ISBN時は最初からfalse
  const [hasMore, setHasMore] = useState(!isbn)

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(async () => {
    // ★ ISBN時は何もしない
    if (isbn) return

    if (loading || !hasMore) return

    setLoading(true)

    const res = await fetch(
      `/api/search?title=${encodeURIComponent(keyword)}&page=${page}`
    )

    const newBooks: BookDisplay[] = await res.json()

    // -------------------
    // 終了判定
    // -------------------
    if (newBooks.length === 0) {
      setHasMore(false)
      setLoading(false)
      return
    }

    if (newBooks.length < 20) {
      setHasMore(false)
    }

    setBooks(prev => [...prev, ...newBooks])
    setPage(prev => prev + 1)

    setLoading(false)
  }, [hasMore, isbn, keyword, loading, page])

  // 🔥 ② observer
  useEffect(() => {

    // ★ ISBN時はobserver不要
    if (isbn) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const current = loadMoreRef.current
    if (current) {
      observer.observe(current)
    }

    return () => {
      if (current) observer.unobserve(current)
    }

  }, [isbn, loadMore])

  return (
    <>
      <BookCardGrid books={books} />

      {loading && <BookSkeletonGrid />}

      {/* ★ ISBN時は非表示 */}
      {!isbn && hasMore && (
        <div ref={loadMoreRef} className="h-10" />
      )}

      {/* 終了メッセージ */}
      {!hasMore && !isbn && (
        <p className="text-center text-gray-400 mt-10">
          これ以上の検索結果はありません
        </p>
      )}
    </>
  )
}