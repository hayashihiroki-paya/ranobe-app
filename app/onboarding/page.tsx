// app/onboarding/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

// 👇 既存のタグ入力コンポーネント（使ってるやつに置き換え）
import TagSelector from "@/features/tag/components/TagSelector"

type OnboardingPayload = { tagIds: string[] } | { skip: true }

export default function OnboardingPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { update } = useSession()
  const MIN_TAGS = 3

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[520px] max-h-[80vh] shadow-lg">
        <h1 className="text-xl font-bold mb-2">
          好きな作品のタグを選んでください
        </h1>

        <p className="text-sm text-gray-500 mb-4">
          あなたに合ったおすすめを表示します
        </p>

        <TagSelector
          selectedTags={selectedTags}
          onChange={setSelectedTags}
        />

        <button
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
