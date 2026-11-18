"use client"

import { useRef, useState, type FormEvent } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { ACCOUNT_DELETION_CONFIRMATION } from "@/features/account/constants"

export default function AccountDeletion() {
  const [confirmation, setConfirmation] = useState("")
  const [deleting, setDeleting] = useState(false)
  const inFlight = useRef(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      inFlight.current ||
      confirmation !== ACCOUNT_DELETION_CONFIRMATION
    ) return

    inFlight.current = true
    setDeleting(true)

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      })

      if (!response.ok) {
        let message = "アカウントを削除できませんでした。時間をおいて、もう一度お試しください。"
        try {
          const body: unknown = await response.json()
          if (
            typeof body === "object" &&
            body !== null &&
            "message" in body &&
            typeof body.message === "string"
          ) {
            message = body.message
          }
        } catch {
          // Use the generic message when the response has no JSON body.
        }

        toast.error(message)
        inFlight.current = false
        setDeleting(false)
        return
      }
    } catch {
      toast.error("アカウントを削除できませんでした。時間をおいて、もう一度お試しください。")
      inFlight.current = false
      setDeleting(false)
      return
    }

    try {
      await signOut({ callbackUrl: "/login?accountDeleted=1" })
    } catch {
      toast.error("アカウントは削除されましたが、ログアウトできませんでした。ページを再読み込みしてください。")
      inFlight.current = false
      setDeleting(false)
    }
  }

  return (
    <section
      aria-labelledby="account-deletion-heading"
      className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
    >
      <h2 id="account-deletion-heading" className="text-lg font-semibold text-red-700">
        アカウント削除
      </h2>

      <div id="account-deletion-details" className="mt-3 space-y-3 text-sm text-gray-700">
        <p>削除すると、次の利用者データを削除します。削除後は元に戻せません。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>アカウント情報、パスワード、Google連携情報</li>
          <li>ログインセッション</li>
          <li>お気に入り、ウィッシュ、個人タグ、タグ評価、ランキング</li>
        </ul>
        <p>
          書籍カタログと共有タグは削除されません。Googleアカウントで再度ログインした場合は、新しいアカウントとして登録されることがあります。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3" aria-busy={deleting}>
        <label
          htmlFor="account-deletion-confirmation"
          className="block text-sm font-medium text-gray-800"
        >
          確認のため「{ACCOUNT_DELETION_CONFIRMATION}」と入力してください
        </label>
        <input
          id="account-deletion-confirmation"
          type="text"
          autoComplete="off"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          disabled={deleting}
          aria-describedby="account-deletion-details"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={deleting || confirmation !== ACCOUNT_DELETION_CONFIRMATION}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "削除中..." : "アカウントを削除する"}
        </button>
      </form>
    </section>
  )
}
