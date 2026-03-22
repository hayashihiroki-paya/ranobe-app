// app/library/page.tsx

import { getServerSession } from "next-auth";
import { Suspense } from "react";
import { authOptions } from "../api/auth/[...nextauth]/route";

import LibraryContent from "./LibraryContent";
import LibrarySkeleton from "@/features/library/components/LibrarySkeleton";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>ログインしてください</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        📚 マイライブラリ
      </h1>

      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}