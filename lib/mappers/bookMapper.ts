// lib/mappers/bookMapper.ts

import { RakutenBook } from "@/types/book"
import { Book } from "@prisma/client"

/*
========================================
DB Book → RakutenBook
========================================
*/

export function mapBookToRakutenBook(book: Book): RakutenBook {

  return {

    isbn: book.isbn,

    title: book.title,

    author: book.author,

    largeImageUrl: book.largeImageUrl ?? undefined,

    itemCaption: book.itemCaption ?? undefined

  }

}

/*
========================================
DB Book[] → RakutenBook[]
========================================
*/

export function mapBooksToRakutenBooks(
  books: Book[]
): RakutenBook[] {

  return books.map(mapBookToRakutenBook)

}