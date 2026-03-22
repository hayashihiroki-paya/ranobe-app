// features/book/components/BookCardGridSkeleton.tsx

import BookCardSkeleton from "./BookCardSkeleton";

export default function BookCardGridSkeleton() {
  return (
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
  );
}