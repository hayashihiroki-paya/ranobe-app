// features/book/components/BookDetailSkeleton.tsx

export default function BookDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 画像 */}
        <div className="w-40 h-60 bg-gray-200 rounded" />

        {/* テキスト */}
        <div className="flex-1 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />

          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />

          {/* ボタン */}
          <div className="flex gap-3 mt-4">
            <div className="h-10 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}