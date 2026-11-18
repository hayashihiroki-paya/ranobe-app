import { getUserStats } from "@/lib/api/profile"

export default async function UserStatsCards({ userId }: { userId: string }) {
  const stats = await getUserStats(userId)

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <p className="text-xs text-gray-500 mb-1">お気に入り作品</p>
        <p className="text-2xl font-bold">{stats.likeCount}</p>
      </div>

      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <p className="text-xs text-gray-500 mb-1">登録タグ数</p>
        <p className="text-2xl font-bold">{stats.tagCount}</p>
      </div>
    </div>
  )
}
