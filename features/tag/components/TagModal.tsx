"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Tag = {
  id: string
  name: string
  category: string
}

type Props = {
  isbn: string
  isOpen: boolean
  onClose: () => void
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

export default function TagModal({ isbn, isOpen, onClose }: Props) {
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [loadingTagIds, setLoadingTagIds] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      setIsLoading(true)

      try {
        const tagRes = await fetch("/api/tags")
        const tagData = await tagRes.json()

        const userRes = await fetch(`/api/user-book-tags?isbn=${isbn}`)
        const userData = await userRes.json()

        setTags(tagData)
        setSelectedTags(userData)
        setCurrentIndex(0)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isbn, isOpen])

  const categories = useMemo(() => {
    return categoryOrder.filter(cat =>
      tags.some(tag => tag.category === cat)
    )
  }, [tags])

  const currentCategory = categories[currentIndex]
  const filteredTags = tags.filter(tag => tag.category === currentCategory)

  const toggleTag = async (tagId: string) => {
    if (loadingTagIds.includes(tagId)) return

    setLoadingTagIds(prev => [...prev, tagId])

    try {
      const res = await fetch("/api/user-book-tags/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isbn, tagId }),
      })

      const data = await res.json()

      if (data.status === "added") {
        setSelectedTags(prev => [...prev, tagId])
      } else {
        setSelectedTags(prev => prev.filter(id => id !== tagId))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingTagIds(prev => prev.filter(id => id !== tagId))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-[520px] max-h-[80vh] shadow-lg">

        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">
              好きなポイントを選択
            </h2>
            <p className="text-sm text-gray-500">
              おすすめ精度が向上します（任意）
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* 選択済み */}
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
                        onClick={() => toggleTag(tag.id)}
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

            {/* カテゴリ＋進捗 */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">
                {categoryLabels[currentCategory]}
              </h3>
              <span className="text-xs text-gray-400">
                {currentIndex + 1} / {categories.length}
              </span>
            </div>

            {/* タグ一覧 */}
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
                        onClick={() => toggleTag(tag.id)}
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
                            className={`
                              animate-spin h-3.5 w-3.5 border-2 rounded-full border-t-transparent
                              ${selected
                                ? "border-white"
                                : "border-blue-500"
                              }
                            `}
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
                <button
                  onClick={onClose}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 active:scale-95 transition"
                >
                  完了
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}