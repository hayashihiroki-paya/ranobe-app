import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import UserDetailHeader from "@/features/profile/components/UserDetailHeader";
import UserTagStats from "@/features/profile/components/UserTagStats";
import CommonTags from "@/features/profile/components/CommonTags";
import UserBooksSection from "@/features/profile/components/UserBooksSection";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function UserPage({ params }: Props) {
  const { id } = await params; // 👈 これが重要

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>ログインしてください</div>;
  }

  const targetUserId = id;
  const myUserId = session.user.id;

  return (
    <div className="space-y-8 p-6">
      <UserDetailHeader targetUserId={targetUserId} myUserId={myUserId} />
      <UserTagStats userId={targetUserId} />
      <CommonTags myUserId={myUserId} targetUserId={targetUserId} />
      <UserBooksSection userId={targetUserId} />
    </div>
  );
}