"use client"

import LikeButton from "@/features/like/components/LikeButton"
import WishButton from "@/features/wish/components/WishButton"
import type { RakutenBook } from "@/types/book"

type Props = {
  book: RakutenBook
  onOpenTagModal: () => void
}

export default function BookDetailActions({ book, onOpenTagModal }: Props) {
  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex gap-3">
        <WishButton book={book} />
        <LikeButton book={book} />

        <button
          type="button"
          onClick={onOpenTagModal}
          className="rounded-xl bg-gradient-to-r from-pink-400 to-orange-300 px-4 py-2 text-sm text-white shadow-md hover:shadow-lg"
        >
          📝 タグ編集
        </button>
      </div>
    </div>
  )
}
