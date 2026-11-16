// app/api/search/route.ts
import { NextResponse } from "next/server"
import { BookDisplay } from "@/types/book"
import { RakutenBookResponse } from "@/types/rakuten"

const RAKUTEN_BOOK_SEARCH_API =
  "https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const title = searchParams.get("title")
  const isbn = searchParams.get("isbn")
  const booksGenreId = searchParams.get("booksGenreId")
  const page = searchParams.get("page") ?? "1"

  if (!title && !isbn) {
    return NextResponse.json(
      { error: "title or isbn required" },
      { status: 400 }
    )
  }

  const applicationId = process.env.RAKUTEN_APP_ID
  const accessKey = process.env.RAKUTEN_ACCESS_KEY

  if (!applicationId || !accessKey) {
    return NextResponse.json(
      { error: "Rakuten API is not configured" },
      { status: 503 }
    )
  }

  const url = new URL(RAKUTEN_BOOK_SEARCH_API)
  url.searchParams.set("applicationId", applicationId)

  if (isbn) {
    url.searchParams.set("isbn", isbn)
  } else {
    url.searchParams.set("title", title!)
    url.searchParams.set("page", page)

    if (booksGenreId) {
      url.searchParams.set("booksGenreId", booksGenreId)
    }

    url.searchParams.set("hits", "20")
  }

  url.searchParams.set("format", "json")
  // Keep the legacy nested Items[].Item response used by RakutenBookResponse.
  url.searchParams.set("formatVersion", "1")

  try {
    const res = await fetch(url.toString(), {
      headers: { accessKey },
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("Rakuten Books API returned an unsuccessful response", {
        status: res.status,
      })

      return NextResponse.json(
        { error: "Rakuten API error" },
        { status: 502 }
      )
    }

    const payload: unknown = await res.json()

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("Items" in payload) ||
      !Array.isArray(payload.Items)
    ) {
      console.error("Rakuten Books API returned an unexpected response")

      return NextResponse.json(
        { error: "Rakuten API error" },
        { status: 502 }
      )
    }

    const data = payload as RakutenBookResponse
    const books: BookDisplay[] = data.Items.map(({ Item }) => ({
      isbn: Item.isbn,
      title: Item.title,
      titleKana: Item.titleKana,
      author: Item.author,
      authorKana: Item.authorKana,
      publisherName: Item.publisherName,
      salesDate: Item.salesDate,
      seriesName: Item.seriesName,
      itemCaption: Item.itemCaption,
      largeImageUrl: Item.largeImageUrl,
      comment: "",
    }))

    return NextResponse.json(books)
  } catch {
    console.error("Rakuten Books API request failed")

    return NextResponse.json(
      { error: "Rakuten API error" },
      { status: 502 }
    )
  }
}
