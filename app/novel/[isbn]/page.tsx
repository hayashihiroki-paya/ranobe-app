// app/novel/[isbn]/page.tsx

import { Suspense } from "react"
import BookDetailContent from "./BookDetailContent"
import BookDetailSkeleton from "@/features/book/components/BookDetailSkeleton"

export const dynamic = "force-dynamic"

export default async function BookPage({
  params,
}: {
  params: Promise<{ isbn: string }>
}) {
  const { isbn } = await params

  return (
    <Suspense fallback={<BookDetailSkeleton />}>
      <BookDetailContent isbn={isbn} />
    </Suspense>
  )
}