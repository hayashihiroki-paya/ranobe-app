import { getUserTagStats } from "@/lib/api/profile"

export default async function TagStats({ userId }: { userId: string }) {
  const stats = await getUserTagStats(userId)
  const max = stats[0]?.count || 1

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        📊 タグ入力傾向
        <span className="text-sm text-gray-500">TOP5</span>
      </h2>

      <ul className="space-y-3">
        {stats.map((tag, i) => {
          const percent = (tag.count / max) * 100

          return (
            <li key={i} className="flex items-center gap-3">
              <div
                className={`
                  w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold
                  ${i === 0 && "bg-yellow-400 text-white"}
                  ${i === 1 && "bg-gray-300 text-white"}
                  ${i === 2 && "bg-orange-300 text-white"}
                  ${i >= 3 && "bg-gray-100 text-gray-600"}
                `}
              >
                {i + 1}
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{tag.name}</span>
                  <span className="text-gray-500">{tag.count}pt</span>
                </div>

                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
