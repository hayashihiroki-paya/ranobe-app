"use client"

import { useState } from "react"
import { Book, BookInput } from "@/types/book"
import {
  createBook,
  updateBook,
  deleteBook,
  fetchBooks,
} from "@/lib/api/books"
import BookList from "./BookList"
import BookForm from "./BookForm"

type Props = {
  initialBooks: Book[]
}

export default function BooksPageClient({ initialBooks }: Props) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function reloadBooks() {
    const data = await fetchBooks()
    setBooks(data)
  }

  async function handleCreateOrUpdate(data: BookInput) {
    try {
      setApiError(null)
      setIsLoading(true)

      if (editingBook) {
        await updateBook(editingBook.id, data)
        setEditingBook(null)
      } else {
        await createBook(data)
      }

      await reloadBooks()
    } catch (error: any) {
      setApiError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      setIsLoading(true)
      await deleteBook(id)
      await reloadBooks()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1>Books管理</h1>

      {apiError && (
        <div style={{ color: "red", marginBottom: 10 }}>
          {apiError}
        </div>
      )}

      <BookForm
        onSubmit={handleCreateOrUpdate}
        editingBook={editingBook}
        apiError={apiError}
        isLoading={isLoading}
      />

      <BookList
        books={books}
        onDelete={handleDelete}
        onEdit={setEditingBook}
      />
    </div>
  )
}