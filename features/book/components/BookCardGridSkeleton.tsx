import BookCardSkeletonGrid from "./BookCardSkeletonGrid"

export default function BookCardGridSkeleton() {
  return (
    <BookCardSkeletonGrid
      count={10}
      className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    />
  )
}