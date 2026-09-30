// UserBooksSkeleton.tsx

import BookCardSkeletonGrid from "@/features/book/components/BookCardSkeletonGrid";

export default function UserBooksSkeleton() {
  return (
    <BookCardSkeletonGrid
      count={6}
      className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
    />
  )
}