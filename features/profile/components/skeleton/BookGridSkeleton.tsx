// features/book/components/skeleton/BookGridSkeleton.tsx

export default function BookGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-48 bg-gray-200 rounded animate-pulse"
        />
      ))}
    </div>
  );
}