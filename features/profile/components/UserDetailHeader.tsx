import { prisma } from "@/lib/prisma";
import { getSimilarUsers } from "@/lib/api/similarUsers";

type Props = {
  targetUserId: string;
  myUserId: string;
};

export default async function UserDetailHeader({
  targetUserId,
  myUserId,
}: Props) {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  // 自分との一致度取得
  const similarUsers = await getSimilarUsers(myUserId);
  const match = similarUsers.find((u) => u.id === targetUserId);

  return (
    <div className="border p-4 rounded">
      <h1 className="text-xl font-bold mb-2">
        👤 {user?.name ?? "ユーザー"}
      </h1>

      {match && (
        <div className="text-gray-600">
          一致度 <span className="font-semibold">{match.score}%</span>
        </div>
      )}
    </div>
  );
}