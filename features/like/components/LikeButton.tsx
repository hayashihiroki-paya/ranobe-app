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
          text-xs px-2 py-1 rounded transition
          ${liked ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-600"}
        `}
      >
        {loading ? "更新中..." : liked ? "❤️ お気に入り済み" : "🤍 お気に入り"}
      </button>
    </>
  )
}