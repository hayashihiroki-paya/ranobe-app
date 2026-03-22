// features/profile/components/skeleton/UserHeaderSkeleton.tsx

export default function UserHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="w-16 h-16 bg-gray-200 rounded-full" />
      <div>
        <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}