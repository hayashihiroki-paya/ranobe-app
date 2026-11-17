// app/search/page.tsx
import type { BookDisplay } from "@/types/book"
import InfiniteBookList from "@/features/book/components/InfiniteBookList"
import SearchApiError from "@/features/search/components/SearchApiError"
import SearchBar from "@/features/search/components/SearchBar"

type Props = {
  searchParams: {
    title?: string
    isbn?: string
  }
}

async function searchBooks({
  title,
  isbn,
}: {
  title?: string
  isbn?: string
}): Promise<BookDisplay[] | null> {
  const baseUrl = `${process.env.NEXTAUTH_URL}/api/search`

  const url = isbn
    ? `${baseUrl}?isbn=${encodeURIComponent(isbn)}`
    : `${baseUrl}?title=${encodeURIComponent(title!)}`

  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return null

    const books: unknown = await res.json()
    return Array.isArray(books) ? (books as BookDisplay[]) : null
  } catch {
    return null
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { title, isbn } = await searchParams
  const keyword = title || isbn

  if (!keyword) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <SearchBar />
        <div>検索キーワードを入力してください</div>
      </div>
    )
  }

  const books = await searchBooks({ title, isbn })

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <SearchBar />

      <h1 className="text-xl font-bold mb-2">検索結果</h1>

      {books === null ? (
        <SearchApiError />
      ) : (
        <InfiniteBookList
          key={`${keyword}:${isbn ?? ""}`}
          initialBooks={books}
          keyword={keyword}
          isbn={isbn}
        />
      )}
    </div>
  )
}
