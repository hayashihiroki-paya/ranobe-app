import { prisma } from "@/lib/prisma"

export async function updateBook(
  bookId: string,
  userId: string,
  data: {
    title: string
    author?: string
  }
) {

  return prisma.book.updateMany({
    where: {
      id: bookId,
      userId
    },
    data
  })

}

export async function deleteBook(
  bookId: string,
  userId: string
) {

  return prisma.book.deleteMany({
    where: {
      id: bookId,
      userId
    }
  })

}