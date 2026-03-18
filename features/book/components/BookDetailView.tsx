"use client"

import { useEffect, useState } from "react"
import LikeButton from "@/features/like/components/LikeButton"
import WishButton from "@/features/wish/components/WishButton"
import { RakutenBook } from "@/types/book"

type Props = {
  book: RakutenBook
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
// フェッチ関数（型安全）
// ---------------------------------------------
async function fetchRecommendDetail(isbn: string): Promise<RecommendDetail> {
  const res = await fetch(`/api/books/${isbn}/recommend-detail`)

  if (!res.ok) {
    throw new Error("レコメンド取得に失敗しました")
  }

  return res.json() as Promise<RecommendDetail>
}

export default function BookDetailView({ book }: Props) {

  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"recommend" | "input" | "trend">("recommend")

  const [recommend, setRecommend] = useState<RecommendDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ---------------------------------------------
  // API取得
  // ---------------------------------------------
  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        setLoading(true)
        const data = await fetchRecommendDetail(book.isbn)

        if (isMounted) {
          setRecommend(data)
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : "エラーが発生しました")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [book.isbn])

  // ---------------------------------------------
  // おすすめ理由テキスト生成
  // ---------------------------------------------
  const topTag = recommend?.matchedTags[0]

  const recommendMessage =
    topTag
      ? `あなたが好きな「${topTag.tagName}」要素がほかの読者に好まれています`
      : null

  return (
    <div className="max-w-5xl mx-auto p-6">

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
          {loading ? "..." : `一致度 ${recommend?.score ?? 0}%`}
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
      <div className="border-t mt-6 pt-4 flex gap-4">
        <WishButton book={book} />
        <LikeButton book={book} />
      </div>

      {/* タブ */}
      <div className="border-t mt-6 pt-4">

        <div className="flex gap-4 mb-4">
          {(["recommend", "input", "trend"] as const).map(tab => (
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
              {tab === "input" && "✏ ココ好き入力"}
              {tab === "trend" && "📊 みんなの傾向"}
            </button>
          ))}
        </div>

        <div className="p-4 bg-gray-50 rounded text-sm">

          {/* ローディング */}
          {loading && <p>読み込み中...</p>}

          {/* エラー */}
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

                {recommend?.matchedTags
                  .slice(0, 5)
                  .map(tag => (
                    <span
                      key={tag.tagId}
                      className="px-2 py-1 bg-blue-100 rounded text-xs"
                    >
                      {tag.tagName}
                    </span>
                  ))}

              </div>

              {recommend?.matchCount === 0 && (
                <p className="text-gray-500 text-xs">
                  一致するタグがまだありません
                </p>
              )}
            </div>
          )}

          {/* 入力 */}
          {activeTab === "input" && (
            <div>ココ好き入力エリア（後で実装）</div>
          )}

          {/* 傾向 */}
          {!loading && activeTab === "trend" && (
            <div>

              <p className="mb-2 font-semibold">
                この作品で多いタグ
              </p>

              <div className="flex flex-wrap gap-2">

                {recommend?.bookTagStats.map(tag => (
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