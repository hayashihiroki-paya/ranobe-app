// features/tag/components/TagPicker.tsx
"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Tag = {
  id: string
  name: string
  category: string
}

type Props = {
  tags: Tag[]
  selectedTags: string[]
  onToggle: (tagId: string) => void

  isLoading?: boolean
  loadingTagIds?: string[] // モーダル用
}

const categoryLabels: Record<string, string> = {
  GENRE: "ジャンル",
  PROTAGONIST: "主人公",
  ABILITY: "能力",
  RELATION: "関係性",
  PLOT: "展開",
  TONE: "雰囲気",
  STYLE: "文体",
  NARRATIVE: "語り",
  WORLD: "世界観",
  SETTING: "舞台",
  CHARACTER: "キャラクター",
}

const categoryOrder = [
  "GENRE",
  "PROTAGONIST",
  "CHARACTER",
  "RELATION",
  "ABILITY",
  "SETTING",
  "WORLD",
  "PLOT",
  "NARRATIVE",
  "TONE",
  "STYLE",
]

export default function TagPicker({
  tags,
  selectedTags,
  onToggle,
  isLoading = false,
  loadingTagIds = [],
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const categories = useMemo(() => {
    return categoryOrder.filter(cat =>
      tags.some(tag => tag.category === cat)
    )
  }, [tags])

  const currentCategory = categories[currentIndex]

  const filteredTags = tags.filter(
    tag => tag.category === currentCategory
  )

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-16"
        role="status"
        aria-label="タグを読み込み中"
      >
        <div
          aria-hidden="true"
          className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (tags.length === 0) {
    return (
      <p role="status" className="py-8 text-center text-sm text-gray-500">
        タグがありません
      </p>
    )
  }

  return (
    <>
      {/* 選択中 */}
      {selectedTags.length > 0 && (
        <div className="mb-4" role="group" aria-label="選択済みタグ">
          <p className="text-xs text-gray-400 mb-1">
            選択中
          </p>

          <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto">
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.id === tagId)
              if (!tag) return null

              const loading = loadingTagIds.includes(tagId)

              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-label={`選択を解除: ${tag.name}`}
                  aria-pressed="true"
                  onClick={() => onToggle(tag.id)}
                  disabled={loading}
                  className={`
                    px-3 py-1 rounded-full text-sm flex items-center gap-1 transition
                    bg-blue-100 text-blue-700
                    hover:bg-blue-200 active:scale-95
                    ${loading ? "opacity-50" : ""}
                  `}
                >
                  {loading && (
                    <span
                      aria-hidden="true"
                      className="animate-spin h-3 w-3 border border-blue-500 border-t-transparent rounded-full"
                    />
                  )}
                  {tag.name} ✕
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* カテゴリ */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold" aria-live="polite" aria-atomic="true">
          {categoryLabels[currentCategory]}
        </h3>
        <span
          className="text-xs text-gray-400"
          aria-label={`カテゴリ ${currentIndex + 1} / ${categories.length}`}
        >
          {currentIndex + 1} / {categories.length}
        </span>
      </div>

      {/* タグ */}
      <div className="relative mb-4 h-[260px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex content-start flex-wrap gap-2 overflow-y-auto overscroll-contain pr-1"
          >
            {filteredTags.map(tag => {
              const selected = selectedTags.includes(tag.id)
              const loading = loadingTagIds.includes(tag.id)

              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onToggle(tag.id)}
                  disabled={loading}
                  className={`
                    px-3 py-1 rounded-full border text-sm flex items-center gap-1 transition
                    ${selected
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-gray-100 hover:bg-gray-200"
                    }
                    active:scale-95
                    ${loading ? "opacity-50" : ""}
                  `}
                >
                  {loading && (
                    <span
                      aria-hidden="true"
                      className={`animate-spin h-3.5 w-3.5 border-2 rounded-full border-t-transparent ${
                        selected ? "border-white" : "border-blue-500"
                      }`}
                    />
                  )}
                  {tag.name}
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ナビ */}
      <div className="flex justify-between items-center pt-4 border-t">
        <button
          type="button"
          aria-label="前のタグカテゴリへ"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(i => i - 1)}
          className="text-sm text-gray-500 disabled:opacity-30"
        >
          戻る
        </button>

        <button
          type="button"
          aria-label={
            currentIndex < categories.length - 1
              ? "次のタグカテゴリへ"
              : "最後のカテゴリ"
          }
          aria-disabled={currentIndex >= categories.length - 1}
          onClick={() => {
            if (currentIndex < categories.length - 1) {
              setCurrentIndex((index) => index + 1)
            }
          }}
          className={`rounded-lg px-4 py-2 text-sm transition ${
            currentIndex < categories.length - 1
              ? "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
              : "cursor-not-allowed text-gray-400"
          }`}
        >
          {currentIndex < categories.length - 1 ? "次へ" : "最後のカテゴリ"}
        </button>
      </div>
    </>
  )
}
