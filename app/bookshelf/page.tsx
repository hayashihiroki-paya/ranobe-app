// app/bookshelf/page.tsx

/*
  本棚ページ

  ユーザーが「お気に入り登録」した本を表示するページ

  ・DBからLikeデータ取得
  ・BookCardを使って表示
*/

import { prisma } from "@/lib/prisma"

/*
  NextAuth

  現在ログインしているユーザー情報を取得する
*/
import { getServerSession } from "next-auth"

/*
  NextAuth設定
*/
import { authOptions } from "../api/auth/[...nextauth]/route"

/*
  BookCardコンポーネント

  検索・おすすめ・本棚すべてで共通利用
*/
import BookCard from "@/features/book/components/BookCard"

/*
  楽天Book型
*/
import { RakutenBook } from "@/types/book"
import { mapBooksToRakutenBooks } from "@/lib/mappers/bookMapper"


export default async function BookshelfPage() {

  /*
    ------------------------------------------------
    現在ログインしているユーザーのセッション取得
    ------------------------------------------------
  */

  const session = await getServerSession(authOptions)

  /*
    ------------------------------------------------
    ログインしていない場合
    ------------------------------------------------
  */

  if (!session?.user?.id) {
    return <div>ログインしてください</div>
  }

  /*
    ------------------------------------------------
    Likeテーブルからお気に入り取得
    ------------------------------------------------
  */

  const likes = await prisma.like.findMany({

    /*
      自分のLikeのみ取得
    */
    where: {
      userId: session.user.id
    },

    /*
      Likeに紐づくBook情報も取得
    */
    include: {
      book: true
    },

    /*
      新しい順
    */
    orderBy: {
      createdAt: "desc"
    }

  })


  /*
    ------------------------------------------------
    DBのBookデータを

    RakutenBook型に変換

    理由
    BookCardは楽天API型を使用しているため
    ------------------------------------------------
  */

  const books: RakutenBook[] = mapBooksToRakutenBooks(
    likes.map((l) => l.book)
  )


  return (

    <div className="max-w-6xl mx-auto p-6">

      {/* ===============================
          ページタイトル
      =============================== */}

      <h1 className="text-2xl font-bold mb-6">
        📚 マイ本棚
      </h1>


      {/* ===============================
          お気に入り0件
      =============================== */}

      {books.length === 0 && (

        <p className="text-gray-500">
          お気に入りがありません
        </p>

      )}


      {/* ===============================
          本カードグリッド

          検索結果と同じUI
      =============================== */}

      <div
        className="

        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6

        gap-4
      "
      >

        {books.map((book) => (

          <BookCard

            /*
              key
            */
            key={book.isbn}

            /*
              本データ
            */
            book={book}

            /*
              本棚用UI
            */
            variant="shelf"

          />

        ))}

      </div>

    </div>

  )

}