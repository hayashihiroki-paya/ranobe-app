import type { BookDisplay } from "@/types/book"

export async function fetchSearchPage(keyword: string, page: number) {
  const response = await fetch(
    `/api/search?title=${encodeURIComponent(keyword)}&page=${page}`
  )

  if (!response.ok) {
    throw new Error("検索結果の取得に失敗しました")
  }

  const books: unknown = await response.json()
  if (!Array.isArray(books)) {
    throw new Error("検索結果の取得に失敗しました")
  }

  return books as BookDisplay[]
}
