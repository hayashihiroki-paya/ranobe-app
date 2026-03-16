// app/library/page.tsx

/*
  マイライブラリページ

  本棚 + 読みたい をまとめたページ
*/

import { prisma } from "@/lib/prisma"

import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"

import { mapBooksToRakutenBooks } from "@/lib/mappers/bookMapper"
import LibraryTabs from "@/features/library/components/LibraryTabs"



export default async function LibraryPage() {

  /*
  --------------------------------
  ログインユーザー取得
  --------------------------------
  */

  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>ログインしてください</div>
  }

  /*
  --------------------------------
  本棚取得
  --------------------------------
  */

  const likes = await prisma.like.findMany({

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
  --------------------------------
  Wish取得
  --------------------------------
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
  --------------------------------
  Mapper変換
  --------------------------------
  */

  const likeBooks = mapBooksToRakutenBooks(
    likes.map((l) => l.book)
  )

  const wishBooks = mapBooksToRakutenBooks(
    wishes.map((w) => w.book)
  )

  return (

    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        📚 マイライブラリ
      </h1>

      <LibraryTabs
        shelfBooks={likeBooks}
        wishBooks={wishBooks}
      />

    </div>

  )

}