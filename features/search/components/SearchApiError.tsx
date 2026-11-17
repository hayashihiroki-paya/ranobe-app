"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

type Props = {
  onRetry?: () => void | Promise<void>
  retrying?: boolean
}

export default function SearchApiError({ onRetry, retrying = false }: Props) {
  const router = useRouter()
  const [isRefreshing, startTransition] = useTransition()
  const isRetrying = retrying || isRefreshing

  const handleRetry = () => {
    if (onRetry) {
      void onRetry()
      return
    }

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <section
      role="alert"
      aria-live="assertive"
      className="mt-6 flex flex-col gap-4 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <h2 className="font-semibold">書籍情報を取得できませんでした</h2>
        <p className="text-sm leading-6">
          楽天ブックスAPIへの接続または設定に問題がある可能性があります。
          検索結果が0件という意味ではありません。時間をおいて再試行してください。
        </p>
      </div>
      <button
        type="button"
        onClick={handleRetry}
        disabled={isRetrying}
        className="shrink-0 rounded-md border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRetrying ? "再試行中..." : "再試行"}
      </button>
    </section>
  )
}
