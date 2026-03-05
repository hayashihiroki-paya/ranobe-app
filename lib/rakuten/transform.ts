import { RakutenBookResponse } from "@/types/rakuten"
import { BookDisplay } from "@/types/book"

export function transformRakutenBooks(
  data: RakutenBookResponse
): BookDisplay[] {

  return data.Items.map(({ Item }) => ({
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
}