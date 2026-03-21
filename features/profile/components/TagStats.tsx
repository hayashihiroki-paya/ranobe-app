import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserTagStats } from "@/lib/api/profile";

export default async function TagStats() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const stats = await getUserTagStats(session.user.id);

  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold mb-2">📊 タグ入力傾向TOP5</h2>

      <ul className="space-y-1">
        {stats.map((tag, i) => (
          <li key={i}>
            {i + 1}位 {tag.name} ({tag.count}回)
          </li>
        ))}
      </ul>
    </div>
  );
}