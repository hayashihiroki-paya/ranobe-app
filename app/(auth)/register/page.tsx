"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import Link from "next/link"
import { toast } from "sonner"
import AuthFormError from "@/features/auth/components/AuthFormError"
import {
  registrationFormSchema,
  type RegistrationFormValues,
} from "@/features/schemas"

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
  })

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: RegistrationFormValues) => {
    setLoading(true)
    let accountCreated = false

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const body: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "登録に失敗しました"
        toast.error(message)
        return
      }

      accountCreated = true
      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (!loginResult?.ok || loginResult.error) {
        toast.error("登録は完了しましたが、自動ログインできませんでした。ログインしてください")
        router.push("/login")
        return
      }

      const session = await getSession()
      if (!session?.user) {
        toast.error("登録は完了しましたが、ログイン状態を確認できませんでした。ログインしてください")
        router.push("/login")
        return
      }

      toast.success("アカウントを登録しました")
      router.push(session.user.onboardingDone ? "/" : "/onboarding")
    } catch {
      if (accountCreated) {
        toast.error("登録は完了しましたが、自動ログインできませんでした。ログインしてください")
        router.push("/login")
      } else {
        toast.error("登録に失敗しました。時間をおいて再試行してください")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">新規登録</h1>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          aria-busy={loading}
        >
          <div>
            <label htmlFor="register-name" className="mb-1 block text-sm font-medium">
              名前
            </label>
            <input
              id="register-name"
              {...register("name")}
              type="text"
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "register-name-error" : undefined}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <AuthFormError id="register-name-error" message={errors.name?.message} />
          </div>

          <div>
            <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="register-email"
              {...register("email")}
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "register-email-error" : undefined}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <AuthFormError id="register-email-error" message={errors.email?.message} />
          </div>

          <div>
            <label htmlFor="register-password" className="mb-1 block text-sm font-medium">
              パスワード
            </label>
            <input
              id="register-password"
              {...register("password")}
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "register-password-error" : undefined}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <AuthFormError id="register-password-error" message={errors.password?.message} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-2 text-white transition disabled:opacity-50 ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
