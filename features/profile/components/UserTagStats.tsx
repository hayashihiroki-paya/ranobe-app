import { getUserTagStats } from "@/lib/api/profile";

export default async function UserTagStats({ userId }: { userId: string }) {
  const stats = await getUserTagStats(userId);

  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold mb-2">📊 タグ傾向</h2>

      <ul>
        {stats.map((tag, i) => (
          <li key={i}>
            {i + 1}位 {tag.name} ({tag.count})
          </li>
        ))}
      </ul>
    </div>
  );
}