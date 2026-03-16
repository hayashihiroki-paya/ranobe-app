// app/wish/page.tsx

/*
  ウィッシュリストページ

  ユーザーが「読んでみたい登録」した本を表示

  ・Wishテーブル取得
  ・BookCard表示
*/

import { prisma } from "@/lib/prisma"

import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"

import BookCard from "@/features/book/components/BookCard"

import { RakutenBook } from "@/types/book"
import { mapBooksToRakutenBooks } from "@/lib/mappers/bookMapper"

export default async function WishPage() {

  /*
  -------------------------------------
  ログインユーザー取得
  -------------------------------------
  */

  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>ログインしてください</div>
  }

  /*
  -------------------------------------
  Wish取得
  -------------------------------------
  */

  const wishes = await prisma.wish.findMany({

    where: {
      userId: session.user.id
    },

    include: {
      book: true
    },

    orderBy: {
      createdAt: "desc"
    }

  })

  /*
  -------------------------------------
  DB Book → RakutenBook変換
  -------------------------------------
  */

const books: RakutenBook[] = mapBooksToRakutenBooks(
  wishes.map((w) => w.book)
)

  return (

    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        ⭐ 読んでみたい本
      </h1>

      {books.length === 0 && (

        <p className="text-gray-500">
          ウィッシュリストがありません
        </p>

      )}

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
            key={book.isbn}
            book={book}
            variant="shelf"
          />

        ))}

      </div>

    </div>

  )

}