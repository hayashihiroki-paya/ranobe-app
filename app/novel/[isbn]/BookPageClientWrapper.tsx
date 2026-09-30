// app\novel\[isbn]\BookPageClientWrapper.tsx
"use client"

import { useState } from "react"
import TagModal from "@/features/tag/components/TagModal"
import BookDetailView from "@/features/book/components/BookDetailView"
import { RakutenBook } from "@/types/book"

export default function BookPageClientWrapper({
  book,
  userId,
}: {
  book: RakutenBook
  userId: string | null
}) {
  const [openTagModal, setOpenTagModal] = useState(false);
  // console.log("book.isbn", book.isbn);

  if (!userId) return <div>ログインしてください</div>

  return (
    <div className="p-6">
      <BookDetailView
        book={book}
        onOpenTagModal={() => setOpenTagModal(true)}
      />

      <TagModal
        isbn={book.isbn}
        isOpen={openTagModal}
        onClose={() => setOpenTagModal(false)}
      />
    </div>
  )
}