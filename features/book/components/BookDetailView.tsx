// features\book\components\BookDetailView.tsx
"use client"

import { useState } from "react"
import LikeButton from "@/features/like/components/LikeButton"
import { RakutenBook } from "@/types/book"
import WishButton from "@/features/wish/components/WishButton"

type Props = {
  book: RakutenBook
}

export default function BookDetailView({ book }: Props) {

  const [expanded, setExpanded] = useState(false)

  return (

    <div className="max-w-5xl mx-auto p-6">

      {/* 戻る */}
      <button
        onClick={() => history.back()}
        className="text-sm text-blue-600 mb-4"
      >
        ← 戻る
      </button>

      {/* タイトルエリア */}
      <div className="flex justify-between items-start border-b pb-3">

        <div>
          <h1 className="text-2xl font-bold">
            {book.title}
          </h1>

          <p className="text-sm text-gray-500">
            {book.seriesName}
          </p>
        </div>

        <div className="text-orange-500 font-semibold">
          一致度 82%
        </div>

      </div>

      {/* メイン情報 */}
      <div className="grid grid-cols-[180px_1fr] gap-6 py-6">

        {/* 書影 */}
        <img
          src={book.largeImageUrl}
          alt={book.title}
          className="rounded-lg shadow"
        />

        <div className="text-sm space-y-2">

          <p><b>作者</b> {book.author}</p>
          <p><b>出版社</b> {book.publisherName}</p>
          <p><b>発売日</b> {book.salesDate}</p>

          {/* タグ仮 */}
          <div className="flex flex-wrap gap-2 mt-2">

            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              ライトノベル
            </span>

          </div>

        </div>

      </div>

      {/* あらすじ */}
      <div className="border-t pt-4">

        <p
          className={`
          text-sm text-gray-700
          ${expanded ? "" : "line-clamp-4"}
          `}
        >
          {book.itemCaption}
        </p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 text-xs mt-1"
        >
          {expanded ? "閉じる" : "続きを読む"}
        </button>

      </div>

      {/* アクションエリア */}
      <div className="border-t mt-6 pt-4 flex gap-4">

        <WishButton book={book} />

        <LikeButton book={book} />

      </div>

      {/* タブエリア */}
      <div className="border-t mt-6 pt-4">

        <div className="flex gap-4 mb-4">

          <button className="px-3 py-1 bg-gray-200 rounded">
            ✏ ココ好き入力
          </button>

          <button className="px-3 py-1 bg-gray-200 rounded">
            📊 みんなの傾向
          </button>

        </div>

        <div className="p-4 bg-gray-50 rounded">
          タブ内容表示エリア
        </div>

      </div>

    </div>
  )
}