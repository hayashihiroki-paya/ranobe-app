// features/tag/components/TagModal.tsx
"use client"

import { useEffect, useState } from "react"
import TagPicker from "./TagPicker"

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

export default function TagModal({ isbn, isOpen, onClose }: Props) {
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

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
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isbn, isOpen])

  // 🔥 API付きトグル（そのまま残す）
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

        {/* 👇 ここだけにする */}
        <TagPicker
          tags={tags}
          selectedTags={selectedTags}
          onToggle={toggleTag}
          isLoading={isLoading}
          loadingTagIds={loadingTagIds}
        />

        {/* フッター（完了ボタンだけ残す） */}
        <div className="flex justify-end pt-4 border-t mt-4">
          <button
            onClick={onClose}
            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 active:scale-95 transition"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  )
}