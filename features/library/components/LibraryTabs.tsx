"use client"

import { useState } from "react"
import Link from "next/link"
import type { RakutenBook } from "@/types/book"
import BookCardGrid from "@/features/book/components/BookCardGrid"

type Props = {
  shelfBooks: RakutenBook[]
  wishBooks: RakutenBook[]
}

export default function LibraryTabs({ shelfBooks, wishBooks }: Props) {
  const [tab, setTab] = useState<"shelf" | "wish">("shelf")
  const books = tab === "shelf" ? shelfBooks : wishBooks
  const emptyMessage =
    tab === "shelf"
      ? "お気に入りに登録された本はありません"
      : "ウィッシュに登録された本はありません"

  return (
    <section aria-label="マイライブラリ">
      <div
        role="group"
        aria-label="ライブラリの種類"
        className="mb-6 flex gap-2"
      >
        <button
          type="button"
          aria-pressed={tab === "shelf"}
          onClick={() => setTab("shelf")}
          className={`rounded px-4 py-2 ${
            tab === "shelf" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          本棚
        </button>
        <button
          type="button"
          aria-pressed={tab === "wish"}
          onClick={() => setTab("wish")}
          className={`rounded px-4 py-2 ${
            tab === "wish" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          読みたい
        </button>
      </div>

      {books.length === 0 ? (
        <div
          className="rounded-xl bg-gray-50 px-6 py-10 text-center"
          role="status"
        >
          <p className="text-gray-600">{emptyMessage}</p>
          <Link
            href="/search"
            className="mt-3 inline-block text-sm text-blue-600 hover:underline"
          >
            本を探す
          </Link>
        </div>
      ) : (
        <BookCardGrid books={books} />
      )}
    </section>
  )
}
