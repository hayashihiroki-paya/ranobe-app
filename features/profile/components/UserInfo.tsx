import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function UserInfo() {
  const session = await getServerSession(authOptions)

  const user = session?.user

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-4">

      {/* アイコン */}
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
        {user?.name?.[0] ?? "U"}
      </div>

      {/* ユーザー情報 */}
      <div>
        <h2 className="text-lg font-semibold">
          {user?.name ?? "ユーザー"}
        </h2>
        <p className="text-sm text-gray-500">
          マイプロフィール
        </p>
      </div>

    </div>
  )
}