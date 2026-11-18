// app/novel/[isbn]/BookDetailContent.tsx

import type { RakutenBook } from "@/types/book"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import BookPageClientWrapper from "./BookPageClientWrapper"
import BookDetailStatus from "./BookDetailStatus"

async function getBook(isbn: string): Promise<RakutenBook | null> {
  const applicationId = process.env.RAKUTEN_APP_ID
  if (!applicationId) {
    throw new Error("Rakuten API is not configured")
  }

  const url = new URL(
    "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"
  )
  url.searchParams.set("applicationId", applicationId)
  url.searchParams.set("isbn", isbn)

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Rakuten API request failed")
  }

  const data: unknown = await res.json()
  if (
    typeof data !== "object" ||
    data === null ||
    !("Items" in data) ||
    !Array.isArray(data.Items)
  ) {
    throw new Error("Rakuten API returned an invalid response")
  }

  const items = data.Items as Array<{ Item?: unknown }>
  if (items.length === 0) return null

  const item = items[0]?.Item
  if (!item || typeof item !== "object") {
    throw new Error("Rakuten API returned an invalid book")
  }

  return item as RakutenBook
}

export default async function BookDetailContent({
  isbn,
}: {
  isbn: string
}) {
  let book: RakutenBook | null

  try {
    book = await getBook(isbn)
  } catch {
    return <BookDetailStatus kind="connection-error" />
  }

  if (!book) {
    return <BookDetailStatus kind="not-found" />
  }

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null

  return <BookPageClientWrapper book={book} userId={userId} />
}
