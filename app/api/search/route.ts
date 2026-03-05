import { NextResponse } from "next/server"
import { BookDisplay } from "@/types/book"
import { RakutenBookResponse } from "@/types/rakuten"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)

  const title = searchParams.get("title")
  const booksGenreId = searchParams.get("booksGenreId")

  if (!title) {
    return NextResponse.json(
      { error: "title required" },
      { status: 400 }
    )
  }

  const url = new URL(
    "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"
  )

  url.searchParams.set("applicationId", process.env.RAKUTEN_APP_ID!)
  url.searchParams.set("title", title)

  if (booksGenreId) {
    url.searchParams.set("booksGenreId", booksGenreId)
  }

  url.searchParams.set("format", "json")
  url.searchParams.set("hits", "20")

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