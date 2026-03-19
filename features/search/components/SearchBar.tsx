"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function SearchBar() {

  const router = useRouter()
  const searchParams = useSearchParams()

  const q = searchParams.get("q") ?? ""
  const [keyword, setKeyword] = useState(q)

  // URLが変わったときにinputも更新
  useEffect(() => {
    setKeyword(q)
  }, [q])

  const handleSearch = () => {
    if (!keyword.trim()) return
    router.push(`/search?q=${keyword}`)
    router.refresh()
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