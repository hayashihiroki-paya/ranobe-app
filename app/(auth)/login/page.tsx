"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import AuthFormError from "@/features/auth/components/AuthFormError"
import { loginFormSchema, type LoginFormValues } from "@/features/schemas"

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  })

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (!result?.ok || result.error) {
        toast.error("メールアドレスまたはパスワードを確認してください")
        return
      }

      const session = await getSession()
      if (!session?.user) {
        toast.error("ログイン状態を確認できませんでした。もう一度お試しください")
        return
      }

      toast.success("ログインしました")
      router.push(session.user.onboardingDone ? "/" : "/onboarding")
    } catch {
      toast.error("ログインに失敗しました。時間をおいて再試行してください")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (loading) return
    setLoading(true)

    try {
      await signIn("google", { callbackUrl: "/post-login" })
    } catch {
      toast.error("Googleログインを開始できませんでした。もう一度お試しください")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border py-2 transition hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? "ログイン中..." : "Googleでログイン"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">または</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          aria-busy={loading}
        >
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="login-email"
              {...register("email")}
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <AuthFormError id="login-email-error" message={errors.email?.message} />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-medium">
              パスワード
            </label>
            <input
              id="login-password"
              {...register("password")}
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <AuthFormError id="login-password-error" message={errors.password?.message} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-2 text-white transition disabled:opacity-50 ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
