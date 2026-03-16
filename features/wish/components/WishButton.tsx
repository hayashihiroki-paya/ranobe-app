"use client"

import { useState } from "react"
import { RakutenBook } from "@/types/book"
import { unwishBook, wishBook } from "../api/wish"
import { useWishStore } from "../store/useWishStore"

type Props = {
  book: RakutenBook
}

export default function WishButton({ book }: Props) {

  const isWished = useWishStore((s) => s.isWished)
  const wish = useWishStore((s) => s.wish)
  const unwish = useWishStore((s) => s.unwish)

  const wished = isWished(book.isbn)

  const [loading, setLoading] = useState(false)

  const handleClick = async () => {

    if (loading) return

    setLoading(true)

    try {

      if (wished) {

        unwish(book.isbn)
        await unwishBook(book.isbn)

      } else {

        wish(book.isbn)
        await wishBook(book)

      }

    } catch (err) {

      console.error(err)
      alert("ウィッシュ更新に失敗しました")

    } finally {

      setLoading(false)

    }
  }

  return (

    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleClick()
      }}

      disabled={loading}

      className={`
        text-xs
        px-2
        py-1
        rounded
        transition
        ${wished
          ? "bg-yellow-100 text-yellow-700"
          : "bg-gray-100 text-gray-600"}
      `}
    >

      {
        loading
          ? "更新中..."
          : wished
            ? "📌 ウィッシュ済み"
            : "📌 ウィッシュ"
      }

    </button>

  )
}