"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SearchBar() {

  const router = useRouter()
  const [keyword, setKeyword] = useState("")

  const handleSearch = () => {
    if (!keyword) return
    router.push(`/search?q=${keyword}`)
  }

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="タイトル・作者で検索"
      />

      <button onClick={handleSearch}>
        検索
      </button>
    </div>
  )
}