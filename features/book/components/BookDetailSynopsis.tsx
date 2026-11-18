"use client"

import { useState } from "react"

export default function BookDetailSynopsis({
  synopsis,
}: {
  synopsis?: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-t pt-4">
      <p className={`text-sm text-gray-700 ${expanded ? "" : "line-clamp-4"}`}>
        {synopsis}
      </p>

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="mt-1 text-xs text-blue-600"
      >
        {expanded ? "閉じる" : "続きを読む"}
      </button>
    </div>
  )
}
