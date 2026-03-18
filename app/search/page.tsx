// app/search/page.tsx
import InfiniteBookList from "@/features/book/components/InfiniteBookList"
import SearchBar from "@/features/search/components/SearchBar"

type Props = {
  searchParams: Promise<{
    q?: string
  }>
}

async function searchBooks(keyword: string) {

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/search?title=${keyword}`,
    { cache: "no-store" }
  )

  return res.json()
}

export default async function SearchPage({ searchParams }: Props) {

  const { q } = await searchParams
  const keyword = q

  if (!keyword) {
    return <div>検索キーワードを入力してください</div>
  }

  const books = await searchBooks(keyword)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      <SearchBar />

      <h1 className="text-xl font-bold mb-2">
        検索結果
      </h1>

      {/* <p className="text-sm text-gray-500 mb-6">
        「{keyword}」の検索結果：{books.length}件
      </p> */}

      <InfiniteBookList
        initialBooks={books}
        keyword={keyword}
      />

    </div>
  )
}