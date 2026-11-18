type Props = {
  name?: string | null
}

export default function UserInfo({ name }: Props) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
        {name?.[0] ?? "U"}
      </div>

      <div>
        <h2 className="text-lg font-semibold">{name ?? "ユーザー"}</h2>
        <p className="text-sm text-gray-500">マイプロフィール</p>
      </div>
    </div>
  )
}
