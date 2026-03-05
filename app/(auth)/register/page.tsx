// app/(auth)/register/page.tsx
"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const { register, handleSubmit } = useForm()
  const router = useRouter()

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      // 🔥 登録成功後に自動ログイン
      const loginRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (!loginRes?.error) {
        router.push("/") // トップへ移動
      } else {
        alert("登録後ログイン失敗")
      }

    } else {
      alert("登録失敗")
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h1>新規登録</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("name")} placeholder="名前" /><br /><br />
        <input {...register("email")} placeholder="メール" /><br /><br />
        <input {...register("password")} type="password" placeholder="パスワード" /><br /><br />
        <button type="submit">登録</button>
      </form>
    </div>
  )
}