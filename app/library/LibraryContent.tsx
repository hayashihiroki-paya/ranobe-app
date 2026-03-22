// app/library/LibraryContent.tsx

import { prisma } from "@/lib/prisma";
import { mapBooksToRakutenBooks } from "@/lib/mappers/bookMapper";
import LibraryTabs from "@/features/library/components/LibraryTabs";

export default async function LibraryContent({
  userId,
}: {
  userId: string;
}) {
  // 本棚
  const likes = await prisma.like.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { createdAt: "desc" },
  });

  // Wish
  const wishes = await prisma.wish.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { createdAt: "desc" },
  });

  const likeBooks = mapBooksToRakutenBooks(
    likes.map((l) => l.book)
  );

  const wishBooks = mapBooksToRakutenBooks(
    wishes.map((w) => w.book)
  );

  return (
    <LibraryTabs
      shelfBooks={likeBooks}
      wishBooks={wishBooks}
    />
  );
}