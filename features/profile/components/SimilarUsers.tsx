import { getSimilarUsers } from "@/lib/api/similarUsers"
import SimilarUserCard from "./SimilarUserCard"

export default async function SimilarUsers({ userId }: { userId: string }) {
  const users = await getSimilarUsers(userId)

  return (
    <div>
      <h2 className="font-bold mb-4">🤝 類似ユーザー</h2>

      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <SimilarUserCard
            key={user.id}
            id={user.id}
            name={user.name}
            score={user.score}
          />
        ))}
      </div>
    </div>
  )
}
