import { prisma } from "@/lib/prisma"
import { createOrFindBook } from "@/lib/book/createOrFindBook"
import type { BookInput } from "@/types/book"

export async function createUserLike(userId: string, input: BookInput) {
  return prisma.$transaction(async (tx) => {
    const book = await createOrFindBook(tx, input)

    return tx.like.upsert({
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

export async function deleteUserLikeByIsbn(userId: string, isbn: string) {
  const book = await prisma.book.findUnique({
    where: { isbn },
  })

  if (!book) return

  await prisma.like.delete({
    where: {
      userId_bookId: {
        userId,
        bookId: book.id,
      },
    },
  })
}

export async function getUserLikeIsbns(userId: string) {
  const likes = await prisma.like.findMany({
    where: { userId },
    include: {
      book: {
        select: {
          isbn: true,
        },
      },
    },
  })

  return likes.map((like) => like.book.isbn)
}
