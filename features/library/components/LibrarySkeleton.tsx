// features/library/components/LibrarySkeleton.tsx

import BookCardSkeleton from "@/features/book/components/BookCardSkeleton";

export default function LibrarySkeleton() {
  return (
    <div>
      {/* タブ */}
      <div className="flex gap-4 mb-6">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* グリッド */}
      <div
        className="
          grid
          gap-6
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
        "
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}