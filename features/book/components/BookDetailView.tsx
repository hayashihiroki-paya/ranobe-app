"use client"

import { useEffect, useState } from "react"
import LikeButton from "@/features/like/components/LikeButton"
import WishButton from "@/features/wish/components/WishButton"
import { RakutenBook } from "@/types/book"

type Props = {
  book: RakutenBook
  onOpenTagModal: () => void
}

// ---------------------------------------------
// 型定義
// ---------------------------------------------
type Tag = {
  tagId: string
  tagName: string
}

type MatchedTag = Tag & {
  userCount: number
  bookCount: number
  userWeight: number
  bookWeight: number
}

type TagStat = Tag & {
  count: number
}

type RecommendDetail = {
  score: number
  matchCount: number
  matchedTags: MatchedTag[]
  userTagStats: TagStat[]
  bookTagStats: TagStat[]
}

// ---------------------------------------------
// フェッチ関数
// ---------------------------------------------
async function fetchRecommendDetail(isbn: string): Promise<RecommendDetail | null> {
  const res = await fetch(`/api/books/${isbn}/recommend-detail`, {
    cache: "no-store", // 🔥 常に最新
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error("レコメンド取得に失敗しました")

  return res.json()
}

export default function BookDetailView({ book, onOpenTagModal }: Props) {

  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"recommend" | "input" | "trend">("recommend")

  const [recommend, setRecommend] = useState<RecommendDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ---------------------------------------------
  // API取得
  // ---------------------------------------------
  useEffect(() => {
    let ignore = false

    async function load() {
      setLoading(true)
      setError(null)
      setRecommend(null) // 🔥 前の本のデータ残るバグ防止

      try {
        const data = await fetchRecommendDetail(book.isbn)
        if (!ignore) {
          setRecommend(data)
        }
      } catch (e) {
        if (!ignore) {
          setError(e instanceof Error ? e.message : "エラーが発生しました")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    if (book?.isbn) {
      load()
    }

    return () => {
      ignore = true
    }
  }, [book.isbn])

  // ---------------------------------------------
  // おすすめ理由
  // ---------------------------------------------
  const topTag = recommend?.matchedTags?.[0]

  const recommendMessage =
    topTag
      ? `あなたが好きな「${topTag.tagName}」要素が他の読者にも好まれています`
      : null

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">

      <button
        onClick={() => history.back()}
        className="text-sm text-blue-600 mb-4"
      >
        ← 戻る
      </button>

      {/* タイトル */}
      <div className="flex justify-between items-start border-b pb-3">

        <div>
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <p className="text-sm text-gray-500">{book.seriesName}</p>
        </div>

        {/* 一致度 */}
        <div className="text-orange-500 font-semibold">
          {loading
            ? "..."
            : `一致度 ${recommend?.score ?? 0}%`}
        </div>

      </div>

      {/* メイン */}
      <div className="grid grid-cols-[180px_1fr] gap-6 py-6">

        <img
          src={book.largeImageUrl}
          alt={book.title}
          className="rounded-lg shadow"
        />

        <div className="text-sm space-y-2">
          <p><b>作者</b> {book.author}</p>
          <p><b>出版社</b> {book.publisherName}</p>
          <p><b>発売日</b> {book.salesDate}</p>
        </div>

      </div>

      {/* あらすじ */}
      <div className="border-t pt-4">

        <p className={`text-sm text-gray-700 ${expanded ? "" : "line-clamp-4"}`}>
          {book.itemCaption}
        </p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 text-xs mt-1"
        >
          {expanded ? "閉じる" : "続きを読む"}
        </button>

      </div>

      {/* アクション */}
      <div className="border-t mt-6 pt-4">
        <div className="flex gap-3">

          <WishButton book={book} />
          <LikeButton book={book} />

          <button
            onClick={onOpenTagModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-orange-300 text-white text-sm shadow-md hover:shadow-lg"
          >
            📝 タグ編集
          </button>

        </div>
      </div>

      {/* タブ */}
      <div className="border-t mt-6 pt-4">

        <div className="flex gap-4 mb-4">
          {(["recommend", "trend"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {tab === "recommend" && "⭐ おすすめ理由"}
              {tab === "trend" && "📊 みんなの傾向"}
            </button>
          ))}
        </div>

        <div className="p-4 bg-gray-50 rounded text-sm">

          {loading && <p>読み込み中...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {/* おすすめ理由 */}
          {!loading && !error && activeTab === "recommend" && (
            <div>

              {recommendMessage && (
                <p className="mb-2 font-semibold">
                  {recommendMessage}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {recommend?.matchedTags?.slice(0, 5).map(tag => (
                  <span
                    key={tag.tagId}
                    className="px-2 py-1 bg-blue-100 rounded text-xs"
                  >
                    {tag.tagName}
                  </span>
                ))}
              </div>

              {recommend?.matchCount === 0 && (
                <p className="text-gray-500 text-xs mt-2">
                  一致するタグがまだありません
                </p>
              )}
            </div>
          )}

          {/* 傾向 */}
          {!loading && activeTab === "trend" && (
            <div>
              <p className="mb-2 font-semibold">
                この作品で多いタグ
              </p>

              <div className="flex flex-wrap gap-2">
                {recommend?.bookTagStats?.map(tag => (
                  <span
                    key={tag.tagId}
                    className="px-2 py-1 bg-gray-200 rounded text-xs"
                  >
                    {tag.tagName}（{tag.count}）
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}