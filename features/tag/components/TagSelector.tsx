// features/tag/components/TagSelector.tsx
"use client"

import { useEffect, useState } from "react"

type Tag = {
  id: string
  name: string
  category: string
}

type Props = {
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

export default function TagSelector({ selectedTags, onChange }: Props) {
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")

  // タグ取得
  useEffect(() => {
    const fetchTags = async () => {
      const res = await fetch("/api/tags")
      const data = await res.json()

      setTags(data)

      if (data.length > 0) {
        setSelectedCategory(data[0].category)
      }
    }

    fetchTags()
  }, [])

  // カテゴリ一覧
  const categories = [...new Set(tags.map(tag => tag.category))]

  // フィルタ
  const filteredTags = tags.filter(
    tag => tag.category === selectedCategory
  )

  // トグル（ローカルだけ）
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId))
    } else {
      onChange([...selectedTags, tagId])
    }
  }

  return (
    <>
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
                }`}
            >
              {tag.name}
            </button>
          )
        })}
      </div>
    </>
  )
}