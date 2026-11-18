// app/profile/page.tsx
import { getServerSession } from "next-auth"
import { Suspense } from "react"
import BookGridSkeleton from "@/features/profile/components/skeleton/BookGridSkeleton"
import TagStatsSkeleton from "@/features/profile/components/skeleton/TagStatsSkeleton"
import UserCardSkeleton from "@/features/profile/components/skeleton/UserCardSkeleton"
import RecommendSection from "@/features/profile/components/RecommendSection"
import SimilarUsers from "@/features/profile/components/SimilarUsers"
import TagStats from "@/features/profile/components/TagStats"
import UserInfo from "@/features/profile/components/UserInfo"
import UserStatsCards from "@/features/profile/components/UserStatsCards"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user?.id) {
    return <div>ログインしてください</div>
  }

  return (
    <div className="px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        <UserInfo name={user.name} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<TagStatsSkeleton />}>
              <TagStats userId={user.id} />
            </Suspense>

            <Suspense fallback={<BookGridSkeleton />}>
              <RecommendSection userId={user.id} />
            </Suspense>
          </div>

          <div className="space-y-6">
            <Suspense fallback={<div>Loading...</div>}>
              <UserStatsCards userId={user.id} />
            </Suspense>

            <Suspense fallback={<UserCardSkeleton />}>
              <SimilarUsers userId={user.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
