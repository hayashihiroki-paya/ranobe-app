"use client"

import { useState } from "react"
import { likeBook, unlikeBook } from "@/lib/api/like"
import { useLikeStore } from "@/features/like/store/useLikeStore"
import { RakutenBook } from "@/types/book"
import { useTagModalStore } from "@/features/tag/store/useTagModalStore"

type Props = {
  book: RakutenBook
}

export default function LikeButton({ book }: Props) {
  const isLiked = useLikeStore((s) => s.isLiked)
  const like = useLikeStore((s) => s.like)
  const unlike = useLikeStore((s) => s.unlike)
  const liked = isLiked(book.isbn)
  const [loading, setLoading] = useState(false)
  const openTagModal = useTagModalStore((s) => s.open)

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (liked) {
        unlike(book.isbn)
        await unlikeBook(book.isbn)
      } else {
        like(book.isbn)
        await likeBook(book)
        openTagModal(book.isbn)
      }
    } catch (err) {
      console.error(err)
      alert("お気に入り更新に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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

          ${
            liked
              ? `
                bg-gradient-to-r from-pink-400 to-rose-400
                text-white
                shadow-md
                hover:from-pink-500 hover:to-rose-500
              `
              : `
                bg-white
                text-gray-700
                border border-gray-200
                shadow-sm
                hover:bg-pink-50
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
        {loading
          ? "更新中..."
          : liked
            ? "❤️ 登録済み"
            : "🤍 お気に入り"}
      </button>
    </>
  )
}