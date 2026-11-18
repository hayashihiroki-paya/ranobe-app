"use client"

import { useState } from "react"
import type { RecommendDetail } from "@/features/book/hooks/useBookRecommendation"

type Props = {
  recommendation: RecommendDetail | null
  loading: boolean
  error: string | null
}

export default function BookDetailRecommendationPanel({
  recommendation,
  loading,
  error,
}: Props) {
  const [activeTab, setActiveTab] = useState<"recommend" | "trend">("recommend")

  return (
    <section className="mt-6 border-t pt-4">
      <div className="mb-4 flex gap-4">
        {(["recommend", "trend"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={`rounded px-3 py-1 ${
              activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {tab === "recommend" ? "⭐ おすすめ理由" : "📊 みんなの傾向"}
          </button>
        ))}
      </div>

      <div className="rounded bg-gray-50 p-4 text-sm">
        {loading && <p>読み込み中...</p>}
        {!loading && error && <p className="text-red-500">{error}</p>}

        {!loading && !error && activeTab === "recommend" && (
          <div>
            {recommendation?.matchedTags[0] && (
              <p className="mb-2 font-semibold">
                あなたが好きな「{recommendation.matchedTags[0].tagName}」要素が他の読者にも好まれています
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {recommendation?.matchedTags.slice(0, 5).map((tag) => (
                <span
                  key={tag.tagId}
                  className="rounded bg-blue-100 px-2 py-1 text-xs"
                >
                  {tag.tagName}
                </span>
              ))}
            </div>

            {recommendation?.matchCount === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                一致するタグがまだありません
              </p>
            )}
          </div>
        )}

        {!loading && !error && activeTab === "trend" && (
          <div>
            <p className="mb-2 font-semibold">この作品で多いタグ</p>
            <div className="flex flex-wrap gap-2">
              {recommendation?.bookTagStats.map((tag) => (
                <span
                  key={tag.tagId}
                  className="rounded bg-gray-200 px-2 py-1 text-xs"
                >
                  {tag.tagName}（{tag.count}）
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
