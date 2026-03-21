// features/profile/components/skeleton/TagStatsSkeleton.tsx

export default function TagStatsSkeleton() {
  return (
    <div className="border p-4 rounded animate-pulse">
      <div className="h-4 w-40 bg-gray-300 mb-3 rounded" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-32" />
        ))}
      </div>
    </div>
  );
}