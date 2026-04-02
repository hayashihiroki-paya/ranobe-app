// app/api/search/route.ts
import { NextResponse } from "next/server"
import { BookDisplay } from "@/types/book"
import { RakutenBookResponse } from "@/types/rakuten"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)

  const title = searchParams.get("title")
  const isbn = searchParams.get("isbn") // ★追加
  const booksGenreId = searchParams.get("booksGenreId")
  const page = searchParams.get("page") ?? "1"

  // ★バリデーション変更
  if (!title && !isbn) {
    return NextResponse.json(
      { error: "title or isbn required" },
      { status: 400 }
    )
  }

  const url = new URL(
    "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"
  )

  url.searchParams.set("applicationId", process.env.RAKUTEN_APP_ID!)

  // ★ここが分岐ポイント
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

  try {

    const res = await fetch(url.toString())

    const data: RakutenBookResponse = await res.json()

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
      comment: ""
    }))

    return NextResponse.json(books)

  } catch (err) {

    return NextResponse.json(
      { error: "Rakuten API error" },
      { status: 500 }
    )
  }
}