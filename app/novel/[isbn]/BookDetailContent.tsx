// app/novel/[isbn]/BookDetailContent.tsx

import { RakutenBook } from "@/types/book"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import BookPageClientWrapper from "./BookPageClientWrapper"

async function getBook(isbn: string): Promise<RakutenBook | null> {
  const res = await fetch(
    `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${process.env.RAKUTEN_APP_ID}&isbn=${isbn}`,
    { cache: "no-store" } // ← dynamicなら明示しとくと安心
  )

  if (!res.ok) throw new Error("書籍情報の取得に失敗しました")

  const data = await res.json()
  if (!data.Items || data.Items.length === 0) return null

  return data.Items[0].Item
}

export default async function BookDetailContent({
  isbn,
}: {
  isbn: string
}) {
  const book = await getBook(isbn)

  if (!book) {
    return <div>本が見つかりません</div>
  }

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null

  return <BookPageClientWrapper book={book} userId={userId} />
}