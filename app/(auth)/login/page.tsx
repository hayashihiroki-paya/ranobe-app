// app/(auth)/login/page.tsx
"use client"

import { useForm } from "react-hook-form"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type LoginFormData = {
  email: string
  password: string
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginFormData>()
  const router = useRouter()

  const onSubmit = async (data: LoginFormData) => {
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (res?.error) {
      alert("ログイン失敗")
    } else {
      router.push("/")
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h1>ログイン</h1>

      {/* Googleログイン */}
      <button
        onClick={() =>
          signIn("google", { callbackUrl: "/" })
        }
      >
        Googleでログイン
      </button>

      <hr style={{ margin: "20px 0" }} />

      {/* メールログイン */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("email", { required: true })}
          placeholder="メール"
        />
        <br /><br />

        <input
          {...register("password", { required: true })}
          type="password"
          placeholder="パスワード"
        />
        <br /><br />

        <button type="submit">メールでログイン</button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      {/* 🔥 新規登録リンク */}
      <p>
        アカウントをお持ちでない方は{" "}
        <Link href="/register">新規登録はこちら</Link>
      </p>
    </div>
  )
}