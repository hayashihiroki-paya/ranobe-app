// app/search/page.tsx
import BookCard from "@/features/book/components/BookCard"
import SearchBar from "@/features/search/components/SearchBar"

type Props = {
  searchParams: Promise<{
    q?: string
  }>
}

async function searchBooks(keyword: string) {

  const res = await fetch(
    `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${process.env.RAKUTEN_APP_ID}&title=${keyword}`
  )

  const data = await res.json()

  return data.Items
}

export default async function SearchPage({ searchParams }: Props) {

  const { q } = await searchParams
  const keyword = q

  if (!keyword) {
    return <div>検索キーワードを入力してください</div>
  }

  const books = await searchBooks(keyword)

  return (
    <div>

      <SearchBar />

      <h1>検索結果</h1>

      {books.map((item: any) => (

        <BookCard
          key={item.Item.isbn}
          book={item.Item}
        />

      ))}

    </div>
  )
}