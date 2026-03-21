// features\tag\components\TagModal.tsx
"use client"

import { useEffect, useState } from "react"

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
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  // -------------------------------------
  // 初期データ取得
  // -------------------------------------
  useEffect(() => {

    if (!isOpen) return

    const fetchData = async () => {

      try {

        const tagRes = await fetch("/api/tags")
        const tagData = await tagRes.json()

        const userRes = await fetch(`/api/user-book-tags?isbn=${isbn}`)
        const userData = await userRes.json()

        setTags(tagData)
        setSelectedTags(userData)

        if (tagData.length > 0) {
          setSelectedCategory(tagData[0].category)
        }

      } catch (error) {
        console.error(error)
      }
    }

    fetchData()

  }, [isbn, isOpen])

  // -------------------------------------
  // カテゴリ一覧
  // -------------------------------------
  const categories = [...new Set(tags.map(tag => tag.category))]

  // -------------------------------------
  // 選択カテゴリのタグ
  // -------------------------------------
  const filteredTags = tags.filter(tag => tag.category === selectedCategory)

  // -------------------------------------
  // タグクリック
  // -------------------------------------
  const toggleTag = async (tagId: string) => {

    console.log("toggle", isbn, tagId)

    const res = await fetch("/api/user-book-tags/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        isbn,
        tagId
      })
    })

    const data = await res.json()

    if (data.status === "added") {
      setSelectedTags(prev => [...prev, tagId])
    }

    if (data.status === "removed") {
      setSelectedTags(prev => prev.filter(id => id !== tagId))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-lg w-[520px] max-h-[80vh] overflow-y-auto">

        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold">タグを選択</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* カテゴリ */}
        <div className="flex gap-2 mb-4 flex-wrap">

          {categories.map(cat => (

            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full border text-sm
                ${selectedCategory === cat
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
                }`}
            >
              {cat}
            </button>

          ))}

        </div>

        {/* タグ */}
        <div className="flex flex-wrap gap-2">

          {filteredTags.map(tag => {

            const selected = selectedTags.includes(tag.id)

            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full border text-sm
                  ${selected
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-gray-100"
                  }
                `}
              >
                {tag.name}
              </button>
            )
          })}

        </div>

      </div>

    </div>
  )
}