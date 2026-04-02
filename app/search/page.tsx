// app/search/page.tsx
import InfiniteBookList from "@/features/book/components/InfiniteBookList"
import SearchBar from "@/features/search/components/SearchBar"

type Props = {
  searchParams: {
    title?: string
    isbn?: string
  }
}

// ★ API呼び出しを統一
async function searchBooks({
  title,
  isbn,
}: {
  title?: string
  isbn?: string
}) {
  const baseUrl = `${process.env.NEXTAUTH_URL}/api/search`

  const url = isbn
    ? `${baseUrl}?isbn=${isbn}`
    : `${baseUrl}?title=${encodeURIComponent(title!)}`

  const res = await fetch(url, { cache: "no-store" })

  return res.json()
}

export default async function SearchPage({ searchParams }: Props) {

  // ★ ここが重要
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

      <h1 className="text-xl font-bold mb-2">
        検索結果
      </h1>

      <InfiniteBookList
        initialBooks={books}
        keyword={keyword}
        isbn={isbn}
      />

    </div>
  )
}