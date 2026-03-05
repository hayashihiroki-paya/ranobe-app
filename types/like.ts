// types/like.ts
import { Book } from "@prisma/client"

export type LikeWithBook = {
  id: number
  book: Book
}

export type BookInput = {
  isbn: string
  title: string
  titleKana?: string
  author: string
  authorKana?: string
  publisherName?: string
  salesDate?: string
  seriesName?: string
  itemCaption?: string
  largeImageUrl?: string
  comment?: string
}

export type LikeInput = {
  userId: string
  bookId: number
}