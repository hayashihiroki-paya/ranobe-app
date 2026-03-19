"use client"

import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

export default function Header() {

  const { data: session } = useSession()

  return (
    <header style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>

        <Link href="/">
          <h2>LightNovel Recommender</h2>
        </Link>

        <div style={{ display: "flex", gap: 12 }}>

          <Link href="/recommend">
            おすすめ作品を見る
          </Link>

          <Link href="/library">
            マイライブラリ
          </Link>

          {!session ? (
            <button onClick={() => signIn()}>
              ログイン
            </button>
          ) : (
            <button onClick={() => signOut()}>
              ログアウト
            </button>
          )}

        </div>

      </div>
    </header>
  )
}