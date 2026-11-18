// app/onboarding/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useAccessibleDialog } from "@/lib/hooks/useAccessibleDialog"

// 👇 既存のタグ入力コンポーネント（使ってるやつに置き換え）
import TagSelector from "@/features/tag/components/TagSelector"

type OnboardingPayload = { tagIds: string[] } | { skip: true }

export default function OnboardingPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { update } = useSession()
  const MIN_TAGS = 3
  const dialogRef = useAccessibleDialog({ isOpen: true })

  const saveOnboarding = async (payload: OnboardingPayload) => {
    setLoading(true)

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error()
      }
    } catch {
      toast.error("保存に失敗しました")
      setLoading(false)
      return
    }

    try {
      const session = await update()
      if (!session?.user?.onboardingDone) {
        throw new Error()
      }
    } catch {
      toast.error("設定は保存されましたが、ログイン状態を更新できませんでした")
      router.replace("/recommend")
      setLoading(false)
      return
    }

    if ("skip" in payload) {
      toast.success("設定をスキップしました。あとから作品にタグを付けることもできます")
    } else {
      toast.success("設定完了！おすすめを表示します")
    }

    router.replace("/recommend")
    setLoading(false)
  }

  const handleComplete = async () => {
    if (selectedTags.length < MIN_TAGS) {
      toast.error(`最低${MIN_TAGS}個は選択してください`)
      return
    }

    await saveOnboarding({ tagIds: selectedTags })
  }

  const handleSkip = async () => {
    await saveOnboarding({ skip: true })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        aria-busy={loading}
        tabIndex={-1}
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-xl bg-white p-4 shadow-lg sm:max-h-[calc(100dvh-3rem)] sm:p-6"
      >
        <h1
          id="onboarding-title"
          data-dialog-initial-focus
          tabIndex={-1}
          className="mb-2 text-xl font-bold"
        >
          好きな作品のタグを選んでください
        </h1>

        <p id="onboarding-description" className="mb-4 text-sm text-gray-500">
          あなたに合ったおすすめを表示します
        </p>

        <TagSelector
          selectedTags={selectedTags}
          onChange={setSelectedTags}
        />

        <button
          type="button"
          onClick={handleComplete}
          disabled={loading}
          className={`
            w-full mt-6 py-2 rounded-lg text-white transition
            ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}
          `}
        >
          {loading ? "保存中..." : "おすすめを見る"}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="w-full mt-3 text-sm text-gray-500 hover:underline disabled:opacity-50"
        >
          {loading ? "保存中..." : "スキップ"}
        </button>
      </div>
    </div>
  )
}
