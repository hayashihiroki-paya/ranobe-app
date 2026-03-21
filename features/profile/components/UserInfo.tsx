import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function UserInfo() {
  const session = await getServerSession(authOptions);

  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl font-bold">
        👤 {session?.user?.name ?? "ユーザー"}
      </h2>
    </div>
  );
}