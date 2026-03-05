"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/") // ログアウト後トップへ
    router.refresh() // セッション再取得
  }

  return (
    <button onClick={handleLogout}>
      ログアウト
    </button>
  )
}