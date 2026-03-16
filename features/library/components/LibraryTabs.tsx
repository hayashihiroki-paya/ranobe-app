"use client"

/*
  本棚 / Wish 切替UI
*/

import { useState } from "react"

import { RakutenBook } from "@/types/book"
import BookCard from "@/features/book/components/BookCard"

type Props = {

  shelfBooks: RakutenBook[]
  wishBooks: RakutenBook[]

}

export default function LibraryTabs({

  shelfBooks,
  wishBooks

}: Props) {

  const [tab, setTab] = useState<"shelf" | "wish">("shelf")

  const books = tab === "shelf"
    ? shelfBooks
    : wishBooks

  return (

    <div>

      {/* ------------------------
          タブ
      ------------------------ */}

      <div className="flex gap-2 mb-6">

        <button
          onClick={() => setTab("shelf")}
          className={`
            px-4 py-2 rounded
            ${tab === "shelf"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"}
          `}
        >
          本棚
        </button>

        <button
          onClick={() => setTab("wish")}
          className={`
            px-4 py-2 rounded
            ${tab === "wish"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"}
          `}
        >
          読みたい
        </button>

      </div>


      {/* ------------------------
          本0件
      ------------------------ */}

      {books.length === 0 && (

        <p className="text-gray-500">
          本がありません
        </p>

      )}


      {/* ------------------------
          本カード
      ------------------------ */}

      <div
        className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
        gap-4
        "
      >

        {books.map((book) => (

          <BookCard
            key={book.isbn}
            book={book}
            variant={"shelf"}
          />

        ))}

      </div>

    </div>

  )

}