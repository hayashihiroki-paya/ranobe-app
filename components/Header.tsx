"use client"

import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* ロゴ */}
        <Link href="/" className="text-lg font-bold tracking-tight">
          ラノベならべ
        </Link>

        {/* PCナビ */}
        <nav className="hidden md:flex items-center gap-6 text-sm">

          <Link href="/recommend" className="hover:text-blue-500 transition">
            おすすめ
          </Link>

          <Link href="/profile" className="hover:text-blue-500 transition">
            プロフィール
          </Link>

          <Link href="/library" className="hover:text-blue-500 transition">
            ライブラリ
          </Link>

          {!session ? (
            <Link
              href="/login"
              className="ml-4 px-4 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              ログイン
            </Link>
          ) : (
            <button
              onClick={() => signOut()}
              className="ml-4 px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              ログアウト
            </button>
          )}
        </nav>

        {/* モバイルボタン */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* モバイルメニュー */}
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-4 text-sm">

          <Link
            href="/recommend"
            onClick={() => setOpen(false)}
            className="block"
          >
            おすすめ
          </Link>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block"
          >
            プロフィール
          </Link>

          <Link
            href="/library"
            onClick={() => setOpen(false)}
            className="block"
          >
            ライブラリ
          </Link>

          {!session ? (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-2 rounded-lg bg-blue-500 text-white text-center"
            >
              ログイン
            </Link>
          ) : (
            <button
              onClick={() => {
                setOpen(false)
                signOut()
              }}
              className="w-full px-4 py-2 rounded-lg bg-gray-200"
            >
              ログアウト
            </button>
          )}
        </div>
      )}
    </header>
  )
}