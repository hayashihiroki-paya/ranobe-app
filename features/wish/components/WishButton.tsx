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
        flex items-center justify-center gap-2

        text-sm font-medium
        px-4 py-2
        rounded-xl

        transition-all duration-200

        ${wished
          ? `
              bg-gradient-to-r from-yellow-300 to-amber-300
              text-white
              shadow-md
              hover:from-yellow-400 hover:to-amber-400
            `
          : `
              bg-white
              text-gray-700
              border border-gray-200
              shadow-sm
              hover:bg-yellow-50
            `
        }

        hover:-translate-y-0.5
        hover:shadow-lg

        active:translate-y-0
        active:shadow-sm

        disabled:opacity-50
        disabled:cursor-not-allowed
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