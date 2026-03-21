import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import RecommendSection from "@/features/profile/components/RecommendSection";
import SimilarUsers from "@/features/profile/components/SimilarUsers";
import TagStats from "@/features/profile/components/TagStats";
import UserInfo from "@/features/profile/components/UserInfo";
import { Suspense } from "react";
import BookGridSkeleton from "@/features/profile/components/skeleton/BookGridSkeleton";
import TagStatsSkeleton from "@/features/profile/components/skeleton/TagStatsSkeleton";
import UserCardSkeleton from "@/features/profile/components/skeleton/UserCardSkeleton";


export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return <div>ログインしてください</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <UserInfo />

      <Suspense fallback={<TagStatsSkeleton />}>
        <TagStats />
      </Suspense>

      <Suspense fallback={<BookGridSkeleton />}>
        <RecommendSection />
      </Suspense>

      <Suspense fallback={<UserCardSkeleton />}>
        <SimilarUsers />
      </Suspense>
    </div>
  );
}