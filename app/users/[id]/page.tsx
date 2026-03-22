// app/users/[id]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Suspense } from "react";

import UserDetailHeader from "@/features/profile/components/UserDetailHeader";
import UserTagStats from "@/features/profile/components/UserTagStats";
import CommonTags from "@/features/profile/components/CommonTags";
import UserBooksSection from "@/features/profile/components/UserBooksSection";

// スケルトン
import UserHeaderSkeleton from "@/features/profile/components/skeleton/UserHeaderSkeleton";
import UserTagStatsSkeleton from "@/features/profile/components/skeleton/UserTagStatsSkeleton";
import CommonTagsSkeleton from "@/features/profile/components/skeleton/CommonTagsSkeleton";
import UserBooksSkeleton from "@/features/profile/components/skeleton/UserBooksSkeleton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function UserPage({ params }: Props) {
  const { id } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>ログインしてください</div>;
  }

  const targetUserId = id;
  const myUserId = session.user.id;

  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ヘッダー */}
        <Suspense fallback={<UserHeaderSkeleton />}>
          <UserDetailHeader
            targetUserId={targetUserId}
            myUserId={myUserId}
          />
        </Suspense>

        {/* タグ統計 */}
        <Suspense fallback={<UserTagStatsSkeleton />}>
          <UserTagStats userId={targetUserId} />
        </Suspense>

        {/* 共通タグ */}
        <Suspense fallback={<CommonTagsSkeleton />}>
          <CommonTags
            myUserId={myUserId}
            targetUserId={targetUserId}
          />
        </Suspense>

        {/* 本棚 */}
        <Suspense fallback={<UserBooksSkeleton />}>
          <UserBooksSection userId={targetUserId} />
        </Suspense>
      </div>
    </div>
  );
}