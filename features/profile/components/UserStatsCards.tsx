import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUserStats } from "@/lib/api/profile"

export default async function UserStatsCards() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) return null

  const stats = await getUserStats(session.user.id)

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* お気に入り数 */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <p className="text-xs text-gray-500 mb-1">
          お気に入り作品
        </p>
        <p className="text-2xl font-bold">
          {stats.likeCount}
        </p>
      </div>

      {/* タグ数 */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <p className="text-xs text-gray-500 mb-1">
          入力タグ数
        </p>
        <p className="text-2xl font-bold">
          {stats.tagCount}
        </p>
      </div>

    </div>
  )
}