"use client"

/*
  このコンポーネントは
  「本のお気に入り登録 / 解除」を行うボタンです。

  主な役割

  ① DBへLike登録APIを送る
  ② Zustand storeを更新
  ③ UIを即時更新（全ページ同期）

  検索ページ / 詳細ページ / 本棚ページ
  すべて同じボタンを使います。
*/

import { useState } from "react"
import { likeBook, unlikeBook } from "@/lib/api/like"
import { useLikeStore } from "@/features/like/store/useLikeStore"
import { RakutenBook } from "@/types/book"

/*
  Props

  book : 楽天APIから取得した本情報
*/
type Props = {
  book: RakutenBook
}

export default function LikeButton({ book }: Props) {

  /*
    Zustand store から現在のお気に入り状態を取得
  */

  const isLiked = useLikeStore((s) => s.isLiked)
  const like = useLikeStore((s) => s.like)
  const unlike = useLikeStore((s) => s.unlike)

  /*
    この本がお気に入り登録されているか
  */
  const liked = isLiked(book.isbn)

  /*
    API通信中フラグ

    連打による多重リクエスト防止
  */
  const [loading, setLoading] = useState(false)

  /*
    お気に入りクリック処理
  */
  const handleClick = async () => {

    /*
      通信中なら何もしない
      (ダブルクリック防止)
    */
    if (loading) return

    setLoading(true)

    try {

      /*
        =============================
        お気に入り解除
        =============================
      */
      if (liked) {

        /*
          ① UIを先に更新
          (楽観的更新)

          ユーザー体験がかなり良くなる
        */
        unlike(book.isbn)

        /*
          ② DB更新
        */
        await unlikeBook(book.isbn)

      } else {

        /*
          =============================
          お気に入り登録
          =============================
        */

        /*
          ① UI先行更新
        */
        like(book.isbn)

        /*
          ② DB保存
        */
        await likeBook(book)

      }

    } catch (err) {

      /*
        API失敗した場合
      */
      console.error(err)

      alert("お気に入り更新に失敗しました")

    } finally {

      /*
        通信終了
      */
      setLoading(false)

    }
  }

  return (

    <button

      /*
        Card全体がLinkになっているため

        stopPropagationしないと
        ページ遷移が起きる
      */
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

        /*
          liked状態で色を変える
        */
        ${liked
          ? "bg-pink-100 text-pink-600"
          : "bg-gray-100 text-gray-600"}
      `}
    >

      {
        /*
          表示テキスト切り替え
        */
        loading
          ? "更新中..."
          : liked
            ? "❤️ お気に入り済み"
            : "🤍 お気に入り"
      }

    </button>

  )
}