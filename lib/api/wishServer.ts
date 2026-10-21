import { prisma } from "@/lib/prisma"
import { createOrFindBook } from "@/lib/book/createOrFindBook"
import { mapBooksToRakutenBooks } from "@/lib/mappers/bookMapper"
import type { BookInput } from "@/types/book"

export async function createUserWish(userId: string, input: BookInput) {
  return prisma.$transaction(async (tx) => {
    const book = await createOrFindBook(tx, input)

    return tx.wish.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId: book.id,
        },
      },
      update: {},
      create: {
        userId,
        bookId: book.id,
      },
    })
  })
}

export async function deleteUserWishByIsbn(userId: string, isbn: string) {
  const book = await prisma.book.findUnique({
    where: { isbn },
  })

  if (!book) return

  await prisma.wish.delete({
    where: {
      userId_bookId: {
        userId,
        bookId: book.id,
      },
    },
  })
}

export async function getUserWishBooks(userId: string) {
  const wishes = await prisma.wish.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { createdAt: "desc" },
  })

  return mapBooksToRakutenBooks(wishes.map((wish) => wish.book))
}
