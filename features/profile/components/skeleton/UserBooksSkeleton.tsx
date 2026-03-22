// UserBooksSkeleton.tsx

import BookCardSkeleton from "@/features/book/components/BookCardSkeleton";

export default function UserBooksSkeleton() {
  return (
    <div
      className="
        grid
        gap-4
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
      "
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}