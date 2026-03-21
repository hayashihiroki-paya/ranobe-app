"use client"

import { useForm } from "react-hook-form"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

type LoginFormData = {
  email: string
  password: string
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (res?.error) {
      setLoading(false)
      toast.error("メールアドレスまたはパスワードが違います")
      return
    }

    // 🔥 ここ追加（超重要）
    const session = await getSession()

    setLoading(false)

    toast.success("ログインしました！")

    if (session?.user?.onboardingDone) {
      router.push("/")
    } else {
      router.push("/onboarding")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">

        <h1 className="text-2xl font-bold text-center mb-6">
          ログイン
        </h1>

        <button
          onClick={() => signIn("google", { callbackUrl: "/post-login" })}
          className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Googleでログイン
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">または</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <input
              {...register("email", { required: "メールは必須です" })}
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
              {...register("password", { required: "パスワードは必須です" })}
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
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="text-sm text-center mt-6">
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}