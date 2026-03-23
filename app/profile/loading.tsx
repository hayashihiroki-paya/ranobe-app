// app/profile/loading.tsx

import BookGridSkeleton from "@/features/profile/components/skeleton/BookGridSkeleton";
import TagStatsSkeleton from "@/features/profile/components/skeleton/TagStatsSkeleton";
import UserCardSkeleton from "@/features/profile/components/skeleton/UserCardSkeleton";

export default function Loading() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 👤 ヘッダー */}
        <div className="h-24 bg-gray-200 rounded animate-pulse" />

        {/* 📊 ダッシュボード */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* 左 */}
          <div className="lg:col-span-2 space-y-6">

            <TagStatsSkeleton />
            <BookGridSkeleton />

          </div>

          {/* 右 */}
          <div className="space-y-6">

            <div className="h-24 bg-gray-200 rounded animate-pulse" />
            <UserCardSkeleton />

          </div>

        </div>

      </div>
    </div>
  );
}