"use client"

import { useState } from "react"

export default function RecalculateButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/admin/recalculate-tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "エラー")
      }

      setResult(
        `更新完了: ${data.updatedCount} / ${data.totalBooks}`
      )
    } catch (e) {
      setResult("エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "更新中..." : "タグ再計算"}
      </button>

      {result && <p className="mt-2 text-sm">{result}</p>}
    </div>
  )
}