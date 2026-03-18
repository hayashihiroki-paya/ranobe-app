// features\book\components\BookCard.tsx
"use client"

/*
  BookCard

  本情報をカードUIとして表示するコンポーネント

  使用されるページ
  ----------------
  ・検索結果
  ・おすすめ
  ・本棚
  ・ランキング

  Like状態は Zustand(store) で管理しているため
  このコンポーネントでは useState を持ちません
*/

import { useState } from "react"
import Link from "next/link"
import LikeButton from "@/features/like/components/LikeButton"
import { useLikeStore } from "@/features/like/store/useLikeStore"
import { RakutenBook } from "@/types/book"

/*
  カードの表示タイプ

  search     : 検索結果
  shelf      : 本棚
  recommend  : おすすめ
*/
type BookCardVariant =
  | "search"
  | "shelf"
  | "recommend"

/*
  Props
*/
type Props = {

  // 楽天APIから取得した本データ
  book: RakutenBook

  // 表示パターン
  variant?: BookCardVariant

  // おすすめ一致度
  matchRate?: number

  // Like数
  likeCount?: number

  // おすすめ理由
  recommendReason?: string

  // 本棚登録日
  shelfDate?: string
}

export default function BookCard({

  book,
  variant = "search",
  matchRate,
  likeCount,
  recommendReason,
  shelfDate

}: Props) {

  /*
    あらすじ展開状態
  */
  const [expanded, setExpanded] = useState(false)

  /*
    Zustandからお気に入り状態取得

    これにより

    検索
    詳細
    本棚
    ランキング

    全ページの状態が同期される
  */
  const isLiked = useLikeStore((s) => s.isLiked)

  const liked = isLiked(book.isbn)

  return (

    /*
      カード全体クリックで
      詳細ページへ遷移
    */
    <Link href={`/novel/${book.isbn}`}>

      <div
        className={`

        relative
        w-full
        rounded-xl
        border

        /*
          お気に入り状態でカード色変更
        */
        ${liked
            ? "border-pink-300 bg-pink-50"
            : "border-gray-200 bg-white"}

        shadow-sm
        hover:shadow-lg
        hover:-translate-y-1
        transition
        duration-200
        overflow-hidden
        flex
        flex-col
        cursor-pointer
      `}
      >

        {/* ===============================
            一致度バッジ
        =============================== */}

        {typeof matchRate === "number" && (
          <div
            className="
              absolute
              top-2
              right-2
              bg-orange-500
              text-white
              text-xs
              px-2
              py-1
              rounded
              shadow
              font-semibold
            "
          >
            {matchRate}%
          </div>
        )}

        {/* ===============================
            お気に入りバッジ
        =============================== */}

        {liked && (
          <div
            className="
            absolute
            top-2
            left-2
            bg-pink-500
            text-white
            text-xs
            px-2
            py-1
            rounded
            shadow
          ">
            ❤️
          </div>
        )}

        {/* ===============================
            書影
        =============================== */}

        {book.largeImageUrl && (
          <div className="aspect-[3/4] w-full overflow-hidden">
            <img
              src={book.largeImageUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* ===============================
            カード本文
        =============================== */}

        <div className="p-3 flex flex-col gap-2 flex-1">

          {/* タイトル */}
          <h3
            className={`
              text-sm
              font-semibold
              leading-tight
              ${expanded ? "" : "line-clamp-2"}
            `}
          >
            {book.title}
          </h3>

          {/* 著者 */}
          <p className="text-xs text-gray-500">
            {book.author}
          </p>

          {/* おすすめ度表示 */}
          <div className="text-xs text-gray-600 flex flex-col gap-1">

            {typeof matchRate === "number" && (
              <span>🔥 一致度 {matchRate}%</span>
            )}

            {likeCount && (
              <span>⭐ ココ好き {likeCount}件</span>
            )}

          </div>

          {/* ===============================
              検索ページ用UI
          =============================== */}

          {/* {variant === "search" && (
            <div className="text-xs text-gray-600 flex flex-col gap-1">

              {typeof matchRate === "number" && (
                <span>🔥 一致度 {matchRate}%</span>
              )}

              {likeCount && (
                <span>⭐ ココ好き {likeCount}件</span>
              )}

            </div>
          )} */}

          {/* ===============================
              おすすめページ
          =============================== */}

          {/* {variant === "recommend" && recommendReason && (
            <p className="text-xs text-orange-600">
              🔥 {recommendReason}
            </p>
          )} */}

          {/* ===============================
              本棚ページ
          =============================== */}

          {/* {variant === "shelf" && shelfDate && (
            <p className="text-xs text-gray-500">
              登録日 {shelfDate}
            </p>
          )} */}

          {/* ===============================
              あらすじ
          =============================== */}

          {book.itemCaption && (
            <p
              className={`
                text-xs
                text-gray-700
                ${expanded
                  ? "max-h-40 overflow-auto"
                  : "line-clamp-3"}
              `}
            >
              {book.itemCaption}
            </p>
          )}

          {/* ===============================
              フッター
          =============================== */}

          <div className="mt-auto flex items-center justify-between pt-2">

            {/* あらすじ展開 */}
            <button
              onClick={(e) => {

                /*
                  Linkクリックを防ぐ
                */
                e.preventDefault()
                e.stopPropagation()

                setExpanded(!expanded)

              }}
              className="text-xs text-blue-600 hover:underline"
            >
              {expanded ? "閉じる" : "詳細を見る"}
            </button>

            {/* お気に入りボタン */}
            <LikeButton
              book={book}
            />

          </div>

        </div>

      </div>

    </Link>

  )
}