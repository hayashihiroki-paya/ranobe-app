// features/tag/components/TagSelector.tsx
"use client"

import { useEffect, useState } from "react"
import TagPicker from "./TagPicker"

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
  const [isLoading, setIsLoading] = useState(true)

  // タグ取得
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/tags")
        const data = await res.json()
        setTags(data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [])

  // 🔥 ローカルだけでトグル（API叩かない）
  const handleToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId))
    } else {
      onChange([...selectedTags, tagId])
    }
  }

  return (
    <TagPicker
      tags={tags}
      selectedTags={selectedTags}
      onToggle={handleToggle}
      isLoading={isLoading}
    />
  )
}