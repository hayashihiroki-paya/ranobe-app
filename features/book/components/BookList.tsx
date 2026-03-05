"use client"

// ===============================================
// 本一覧表示コンポーネント
// データを受け取って表示するだけ
// ===============================================

import { Book } from "@/types/book"
import BookItem from "./BookItem"

type Props = {
  books: Book[]
  onDelete: (id: string) => void
  onEdit: (book: Book) => void
}

export default function BookList({ books, onDelete, onEdit }: Props) {
  return (
    <div>
      {books.map((book) => (
        <BookItem
          key={book.id}
          book={book}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}