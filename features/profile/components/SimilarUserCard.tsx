import Link from "next/link";

type Props = {
  id: string;
  name: string;
  score: number;
  tags?: string[]; // 後で使う
};

export default function SimilarUserCard({
  id,
  name,
  score,
  tags = [],
}: Props) {
  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white">
      {/* ユーザー名 */}
      <div className="font-bold text-lg mb-1">👤 {name}</div>

      {/* 一致度 */}
      <div className="text-sm text-gray-600 mb-2">
        一致度 <span className="font-semibold">{score}%</span>
      </div>

      {/* タグ（あれば） */}
      {tags.length > 0 && (
        <div className="text-xs text-gray-500 mb-3">
          {tags.slice(0, 3).join(" / ")}
        </div>
      )}

      {/* ボタン */}
      <Link
        href={`/users/${id}`}
        className="text-sm text-blue-500 hover:underline"
      >
        プロフィールを見る →
      </Link>
    </div>
  );
}