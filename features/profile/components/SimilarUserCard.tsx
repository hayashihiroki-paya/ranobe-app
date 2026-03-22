import Link from "next/link";

type Props = {
  id: string;
  name: string;
  score: number;
  tags?: string[];
};

export default function SimilarUserCard({
  id,
  name,
  score,
  tags = [],
}: Props) {
  return (
    <Link
      href={`/users/${id}`}
      className="
        flex items-center justify-between
        border rounded-xl
        px-4 py-3
        bg-white
        shadow-sm hover:shadow-md
        transition
      "
    >
      {/* 左エリア */}
      <div className="flex flex-col min-w-0">
        {/* 名前 */}
        <p className="font-semibold text-sm truncate">
          👤 {name}
        </p>

        {/* タグ */}
        {tags.length > 0 && (
          <p className="text-xs text-gray-500 truncate">
            {tags.slice(0, 3).join(" / ")}
          </p>
        )}
      </div>

      {/* 右エリア */}
      <div className="flex items-center gap-3 shrink-0">
        {/* 一致度 */}
        <div className="text-sm font-semibold text-blue-600">
          {score}%
        </div>

        {/* 矢印 */}
        <span className="text-gray-400">→</span>
      </div>
    </Link>
  );
}