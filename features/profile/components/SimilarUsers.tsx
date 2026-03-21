import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSimilarUsers } from "@/lib/api/similarUsers";
import SimilarUserCard from "./SimilarUserCard";

export default async function SimilarUsers() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const users = await getSimilarUsers(session.user.id);

  return (
    <div>
      <h2 className="font-bold mb-4">🤝 類似ユーザー</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {users.map((u) => (
          <SimilarUserCard
            key={u.id}
            id={u.id}
            name={u.name}
            score={u.score}
          />
        ))}
      </div>
    </div>
  );
}