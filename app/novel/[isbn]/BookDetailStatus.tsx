"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

type Props = {
  kind: "connection-error" | "not-found"
}

export default function BookDetailStatus({ kind }: Props) {
  const router = useRouter()
  const [isRefreshing, startTransition] = useTransition()
  const hasConnectionError = kind === "connection-error"

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <section
        role={hasConnectionError ? "alert" : "status"}
        aria-live={hasConnectionError ? "assertive" : "polite"}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold text-gray-900">
          {hasConnectionError
            ? "書籍情報を読み込めませんでした"
            : "書籍が見つかりませんでした"}
        </h1>
        <p className="mt-3 leading-7 text-gray-700">
          {hasConnectionError
            ? "書籍情報サービスに接続できないため、このページを表示できません。API設定または一時的な障害の可能性があります。しばらくしてから再試行してください。"
            : "指定されたISBNに該当する書籍情報がありません。ISBNを確認して、検索からお探しください。"}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {hasConnectionError && (
            <button
              type="button"
              onClick={() => startTransition(() => router.refresh())}
              disabled={isRefreshing}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "再試行中..." : "再試行"}
            </button>
          )}
          <Link
            href="/search"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            書籍検索へ
          </Link>
        </div>
      </section>
    </main>
  )
}
