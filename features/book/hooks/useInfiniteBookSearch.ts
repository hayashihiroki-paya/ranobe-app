"use client"

import { useCallback, useRef, useState } from "react"
import type { BookDisplay } from "@/types/book"
import { fetchSearchPage } from "../api/search"

type Props = {
  initialBooks: BookDisplay[]
  keyword: string
  disabled: boolean
}

export function useInfiniteBookSearch({
  initialBooks,
  keyword,
  disabled,
}: Props) {
  const [books, setBooks] = useState(initialBooks)
  const [page, setPage] = useState(2)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(!disabled)
  const [error, setError] = useState<string | null>(null)
  const requestInProgress = useRef(false)

  const loadMore = useCallback(async () => {
    if (disabled || requestInProgress.current || loading || !hasMore) return

    requestInProgress.current = true
    setLoading(true)
    setError(null)

    try {
      const newBooks = await fetchSearchPage(keyword, page)

      if (newBooks.length === 0) {
        setHasMore(false)
        return
      }

      if (newBooks.length < 20) {
        setHasMore(false)
      }

      setBooks((previousBooks) => [...previousBooks, ...newBooks])
      setPage((currentPage) => currentPage + 1)
    } catch {
      setError("検索結果の取得に失敗しました")
      setHasMore(false)
    } finally {
      requestInProgress.current = false
      setLoading(false)
    }
  }, [disabled, hasMore, keyword, loading, page])

  return { books, loading, hasMore, error, loadMore }
}
