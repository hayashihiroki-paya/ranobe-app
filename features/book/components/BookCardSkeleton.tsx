// features/book/components/BookCardSkeleton.tsx

export default function BookCardSkeleton() {
  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white animate-pulse">
      {/* 画像 */}
      <div className="w-full h-40 bg-gray-200 rounded mb-4" />

      {/* タイトル */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />

      {/* 著者 */}
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />

      {/* スコア */}
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  );
}