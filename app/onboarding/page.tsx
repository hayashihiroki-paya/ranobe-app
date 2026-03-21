// app/onboarding/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// 👇 既存のタグ入力コンポーネント（使ってるやつに置き換え）
import TagSelector from "@/features/tag/components/TagSelector"

export default function OnboardingPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const MIN_TAGS = 3

  const handleComplete = async () => {
    if (selectedTags.length < MIN_TAGS) {
      toast.error(`最低${MIN_TAGS}個は選択してください`)
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tagIds: selectedTags,
        }),
      })

      if (!res.ok) {
        throw new Error()
      }

      toast.success("設定完了！おすすめを表示します")

      // 🔥 ここが重要
      router.push("/recommend")

    } catch {
      toast.error("保存に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow">

        <h1 className="text-xl font-bold mb-2">
          好きな作品のタグを選んでください
        </h1>

        <p className="text-sm text-gray-500 mb-4">
          あなたに合ったおすすめを表示します
        </p>

        {/* 👇 タグUI */}
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

        {/* スキップ */}
        <button
          onClick={() => router.push("/recommend")}
          className="w-full mt-3 text-sm text-gray-500 hover:underline"
        >
          スキップ
        </button>
      </div>
    </div>
  )
}