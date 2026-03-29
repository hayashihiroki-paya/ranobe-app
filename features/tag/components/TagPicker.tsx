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
      <div className="flex justify-center py-16">
        <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <>
      {/* 選択中 */}
      {selectedTags.length > 0 && (
        <div className="mb-4">
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
                    <span className="animate-spin h-3 w-3 border border-blue-500 border-t-transparent rounded-full" />
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
        <h3 className="font-semibold">
          {categoryLabels[currentCategory]}
        </h3>
        <span className="text-xs text-gray-400">
          {currentIndex + 1} / {categories.length}
        </span>
      </div>

      {/* タグ */}
      <div className="h-[260px] relative overflow-hidden mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-wrap gap-2 content-start overflow-y-auto pr-1"
          >
            {filteredTags.map(tag => {
              const selected = selectedTags.includes(tag.id)
              const loading = loadingTagIds.includes(tag.id)

              return (
                <button
                  key={tag.id}
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
                    <span className={`
                      animate-spin h-3.5 w-3.5 border-2 rounded-full border-t-transparent
                      ${selected ? "border-white" : "border-blue-500"}
                    `} />
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
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(i => i - 1)}
          className="text-sm text-gray-500 disabled:opacity-30"
        >
          戻る
        </button>

        {currentIndex < categories.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(i => i + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 active:scale-95 transition"
          >
            次へ
          </button>
        ) : (
          <div className="text-sm text-gray-400">
            最後のカテゴリ
          </div>
        )}
      </div>
    </>
  )
}