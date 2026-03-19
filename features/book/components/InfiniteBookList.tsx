"use client"

import { useEffect, useRef, useState } from "react"
import { BookDisplay } from "@/types/book"
import BookCardGrid from "./BookCardGrid"
import BookSkeletonGrid from "./BookSkeletonGrid"

type Props = {
  initialBooks: BookDisplay[]
  keyword: string
}

export default function InfiniteBookList({
  initialBooks,
  keyword
}: Props) {

  const [books, setBooks] = useState(initialBooks)
  const [page, setPage] = useState(2)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // 🔥 ① 検索ワード変更時にリセット（最重要）
  useEffect(() => {
    setBooks(initialBooks)
    setPage(2)
    setHasMore(true)
  }, [initialBooks, keyword])

  async function loadMore() {
    if (loading || !hasMore) return

    setLoading(true)

    const res = await fetch(
      `/api/search?title=${keyword}&page=${page}`
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
  }

  // 🔥 ② observerをkeyword変更でも作り直す
  useEffect(() => {

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

  }, [page, hasMore, keyword]) // ← keyword追加

  return (
    <>
      <BookCardGrid books={books} />

      {loading && <BookSkeletonGrid />}

      {/* スクロール監視 */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-10" />
      )}

      {/* 終了メッセージ */}
      {!hasMore && (
        <p className="text-center text-gray-400 mt-10">
          これ以上の検索結果はありません
        </p>
      )}
    </>
  )
}