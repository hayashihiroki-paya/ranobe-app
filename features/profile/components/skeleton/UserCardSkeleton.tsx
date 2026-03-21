// features/profile/components/skeleton/UserCardSkeleton.tsx

export default function UserCardSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="border rounded-xl p-4 animate-pulse"
        >
          <div className="h-4 w-24 bg-gray-300 mb-2 rounded" />
          <div className="h-3 w-16 bg-gray-200 mb-2 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}