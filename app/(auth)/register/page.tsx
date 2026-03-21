"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

type RegisterFormData = {
  name: string
  email: string
  password: string
}

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        toast.error("登録に失敗しました")
        setLoading(false)
        return
      }

      toast.success("登録完了！ログイン中...")

      const loginRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (loginRes?.error) {
        setLoading(false)
        toast.error("ログインに失敗しました")
        return
      }

      // 🔥 ここ追加（超重要）
      const session = await getSession()

      setLoading(false)

      toast.success("ようこそ！")

      if (session?.user?.onboardingDone) {
        router.push("/")
      } else {
        router.push("/onboarding")
      }

    } catch (error) {
      setLoading(false)
      toast.error("エラーが発生しました")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">

        <h1 className="text-2xl font-bold text-center mb-6">
          新規登録
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <input
              {...register("name", { required: "名前は必須です" })}
              placeholder="名前"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("email", {
                required: "メールは必須です",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "メール形式が正しくありません",
                },
              })}
              placeholder="メールアドレス"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("password", {
                required: "パスワードは必須です",
                minLength: {
                  value: 6,
                  message: "6文字以上で入力してください",
                },
              })}
              type="password"
              placeholder="パスワード"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-2 rounded-lg text-white transition
              ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}
            `}
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>

        <p className="text-sm text-center mt-6">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}