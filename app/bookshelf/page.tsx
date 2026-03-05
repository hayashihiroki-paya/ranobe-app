// app/bookshelf/page.tsx

// Prisma（DB操作ライブラリ）
// LikeテーブルなどDBデータを取得するために使う
import { prisma } from "@/lib/prisma"

// NextAuthのセッション取得
// ログインしているユーザー情報を取得できる
import { getServerSession } from "next-auth"

// NextAuth設定
import { authOptions } from "../api/auth/[...nextauth]/route"

// Next.jsのページ遷移用Linkコンポーネント
import Link from "next/link"


// ---------------------------------------------
// 本棚ページ
// Server Component（デフォルト）
// DBに直接アクセスできる
// ---------------------------------------------
export default async function BookshelfPage() {

  // -------------------------------------------------
  // 現在ログインしているユーザーのセッション取得
  // -------------------------------------------------
  const session = await getServerSession(authOptions)

  // -------------------------------------------------
  // ログインしていない場合
  // -------------------------------------------------
  if (!session?.user?.id) {
    return <div>ログインしてください</div>
  }

  // -------------------------------------------------
  // Likeテーブルからユーザーのお気に入り取得
  // -------------------------------------------------
  const likes = await prisma.like.findMany({

    // 自分のLikeのみ取得
    where: {
      userId: session.user.id
    },

    // Likeに紐づくBook情報も一緒に取得
    // Prismaのリレーション機能
    include: {
      book: true
    }
  })

  return (
    <div>

      {/* ページタイトル */}
      <h1>📚 本棚</h1>

      {/* -----------------------------------------
         お気に入りが0件のとき
      ------------------------------------------ */}
      {likes.length === 0 && (
        <p>お気に入りがありません</p>
      )}

      {/* -----------------------------------------
         お気に入り一覧表示
      ------------------------------------------ */}
      {likes.map((like) => (

        <div
          key={like.id}

          // 簡易スタイル
          style={{
            border: "1px solid #ddd",
            padding: 16,
            marginBottom: 12,
            display: "flex",
            gap: 16
          }}
        >

          {/* -----------------------------------------
             本の画像
          ------------------------------------------ */}
          {like.book.largeImageUrl && (
            <img
              src={like.book.largeImageUrl}
              width={100}
              alt={like.book.title}
            />
          )}

          <div>

            {/* 本タイトル */}
            <h3>{like.book.title}</h3>

            {/* 作者 */}
            <p>{like.book.author}</p>

            {/* -----------------------------------------
               詳細ページリンク
               /novel/[isbn] ページへ
            ------------------------------------------ */}
            <Link href={`/novel/${like.book.isbn}`}>
              詳細
            </Link>

          </div>

        </div>

      ))}

    </div>
  )
}