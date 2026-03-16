// lib\api\like.ts
/*
  Like API クライアント

  フロントエンドから
  /api/like へリクエストを送るための関数群

  このファイルは
  「UIとAPIの境界層」

  Reactコンポーネントは
  この関数だけ呼べばよい設計にする
*/

import { RakutenBook } from "@/types/book"

/*
  ==============================
  お気に入り登録
  ==============================

  POST /api/like

  body
  ----------
  book: 楽天APIの本データ

  処理
  ----------
  DBへLike保存
*/

export async function likeBook(book: RakutenBook) {

  const res = await fetch("/api/like", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    /*
      楽天APIのBookオブジェクトを
      そのまま送信
    */
    body: JSON.stringify(book)

  })

  /*
    HTTPエラー判定
  */
  if (!res.ok) {

    /*
      APIからのエラーメッセージ取得
      (あれば)
    */
    let message = "Like登録に失敗しました"

    try {

      const data = await res.json()
      message = data?.message ?? message

    } catch {}

    throw new Error(message)

  }

  /*
    成功時レスポンス
  */
  return res.json()
}

/*
  ==============================
  お気に入り解除
  ==============================

  DELETE /api/like?isbn=XXXX
*/

export async function unlikeBook(isbn: string) {

  const res = await fetch(`/api/like?isbn=${isbn}`, {

    method: "DELETE"

  })

  if (!res.ok) {

    let message = "Like解除に失敗しました"

    try {

      const data = await res.json()
      message = data?.message ?? message

    } catch {}

    throw new Error(message)

  }

  /*
    DELETEの場合
    body返さないAPIも多いので
    json()は呼ばない
  */

}