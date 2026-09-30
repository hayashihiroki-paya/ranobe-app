import BookCardSkeletonGrid from "./BookCardSkeletonGrid"

export default function TopRecommendSkeleton() {
  return (
    <BookCardSkeletonGrid
      count={5}
      className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
    />
  )
}