"use client"

import { useEffect, useState } from "react"

export type RecommendDetail = {
  score: number
  matchCount: number
  matchedTags: Array<{
    tagId: string
    tagName: string
  }>
  bookTagStats: Array<{
    tagId: string
    tagName: string
    count: number
  }>
}

export function useBookRecommendation(isbn: string) {
  const [recommendation, setRecommendation] = useState<RecommendDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      setLoading(true)
      setError(null)
      setRecommendation(null)

      try {
        const response = await fetch(
          `/api/books/${isbn}/recommend-detail`,
          { cache: "no-store" },
        )

        if (response.status === 404) {
          if (!ignore) setRecommendation(null)
          return
        }

        if (!response.ok) {
          throw new Error("レコメンド取得に失敗しました")
        }

        const data = (await response.json()) as RecommendDetail
        if (!ignore) setRecommendation(data)
      } catch (cause) {
        if (!ignore) {
          setError(
            cause instanceof Error ? cause.message : "エラーが発生しました",
          )
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    if (isbn) {
      void load()
    }

    return () => {
      ignore = true
    }
  }, [isbn])

  return { recommendation, loading, error }
}
