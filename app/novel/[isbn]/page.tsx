// app\novel\[isbn]\page.tsx
import LikeButton from "@/features/like/components/LikeButton"

export const dynamic = 'force-dynamic';

async function getBook(isbn: string) {

  const res = await fetch(
    `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${process.env.RAKUTEN_APP_ID}&isbn=${isbn}`
  )

  const data = await res.json()

  if (!data.Items || data.Items.length === 0) {
    return null
  }

  return data.Items[0].Item
}

export default async function BookPage(
  { params }: { params: { isbn: string } }
) {

  const { isbn } = await params

  const book = await getBook(isbn)

  if (!book) {
    return <div>本が見つかりません</div>
  }

  return (
    <div>

      <h1>{book.title}</h1>

      <p>{book.author}</p>

      {book.largeImageUrl && (
        <img
          src={book.largeImageUrl}
          alt={book.title}
        />
      )}

      <p>{book.itemCaption}</p>

      <LikeButton
        book={book}
        initialLiked={false}
      />

    </div>
  )
}