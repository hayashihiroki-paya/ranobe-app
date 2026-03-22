// features/book/components/TopRecommendSkeleton.tsx

import BookCardSkeleton from "./BookCardSkeleton";

export default function TopRecommendSkeleton() {
  return (
    <div
      className="
        grid
        gap-6
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-5
      "
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}