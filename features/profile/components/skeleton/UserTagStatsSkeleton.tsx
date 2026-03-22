// UserTagStatsSkeleton.tsx

export default function UserTagStatsSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-40" />
      ))}
    </div>
  );
}