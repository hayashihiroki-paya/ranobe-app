"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ★ title / isbn 両対応
  const title = searchParams.get("title") ?? ""
  const isbn = searchParams.get("isbn") ?? ""
  const initialValue = title || isbn

  const [keyword, setKeyword] = useState(initialValue)

  useEffect(() => {
    setKeyword(initialValue)
  }, [initialValue])

  // ★ ISBN判定
  const isIsbn = (input: string) => {
    const normalized = input.replace(/[-\s]/g, "")
    return /^\d{10}(\d{3})?$/.test(normalized)
  }

  const handleSearch = () => {
    const trimmed = keyword.trim()
    if (!trimmed) return

    const normalized = trimmed.replace(/[-\s]/g, "")

    if (isIsbn(trimmed)) {
      router.push(`/search?isbn=${normalized}`)
    } else {
      router.push(`/search?title=${encodeURIComponent(trimmed)}`)
    }

    router.refresh()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-2xl flex items-center gap-2 bg-white shadow-md rounded-2xl px-3 py-2 border">
        
        {/* アイコン */}
        <Search className="w-5 h-5 text-gray-400" />

        {/* 入力欄 */}
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="タイトル or ISBNで検索"
          className="
            flex-1
            text-base
            outline-none
            bg-transparent
            placeholder:text-gray-400
          "
        />

        {/* ボタン */}
        <button
          onClick={handleSearch}
          className="
            bg-blue-500 hover:bg-blue-600
            text-white
            px-4 py-2
            rounded-xl
            text-sm
            font-medium
            transition
            shadow-sm
          "
        >
          検索
        </button>
      </div>
    </div>
  )
}