// CommonTagsSkeleton.tsx

export default function CommonTagsSkeleton() {
  return (
    <div className="flex gap-2 flex-wrap animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-6 w-16 bg-gray-200 rounded-full" />
      ))}
    </div>
  );
}