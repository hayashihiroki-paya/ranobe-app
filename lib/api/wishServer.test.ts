import { beforeEach, describe, expect, it, vi } from "vitest"

const { prismaMock, transactionMock, createOrFindBookMock, mapBooksMock } =
  vi.hoisted(() => ({
    prismaMock: {
      $transaction: vi.fn(),
      book: { findUnique: vi.fn() },
      wish: { delete: vi.fn(), findMany: vi.fn() },
    },
    transactionMock: {
      wish: { upsert: vi.fn() },
    },
    createOrFindBookMock: vi.fn(),
    mapBooksMock: vi.fn(),
  }))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/book/createOrFindBook", () => ({
  createOrFindBook: createOrFindBookMock,
}))
vi.mock("@/lib/mappers/bookMapper", () => ({
  mapBooksToRakutenBooks: mapBooksMock,
}))

import {
  createUserWish,
  deleteUserWishByIsbn,
  getUserWishBooks,
} from "./wishServer"

describe("wish server operations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(transactionMock)
    )
    createOrFindBookMock.mockResolvedValue({ id: 12 })
    transactionMock.wish.upsert.mockResolvedValue({ id: "wish-1" })
  })

  it("creates a wish with the book in one transaction", async () => {
    const input = {
      isbn: "9780000000001",
      title: "The Example",
      author: "A. Writer",
    }

    await expect(createUserWish("reader-1", input)).resolves.toEqual({
      id: "wish-1",
    })
    expect(prismaMock.$transaction).toHaveBeenCalledOnce()
    expect(createOrFindBookMock).toHaveBeenCalledWith(transactionMock, input)
    expect(transactionMock.wish.upsert).toHaveBeenCalledWith({
      where: { userId_bookId: { userId: "reader-1", bookId: 12 } },
      update: {},
      create: { userId: "reader-1", bookId: 12 },
    })
  })

  it("deletes a wish for an existing ISBN", async () => {
    prismaMock.book.findUnique.mockResolvedValue({ id: 12 })

    await deleteUserWishByIsbn("reader-1", "9780000000001")

    expect(prismaMock.wish.delete).toHaveBeenCalledWith({
      where: { userId_bookId: { userId: "reader-1", bookId: 12 } },
    })
  })

  it("does nothing when the ISBN is not in the database", async () => {
    prismaMock.book.findUnique.mockResolvedValue(null)

    await expect(
      deleteUserWishByIsbn("reader-1", "unknown")
    ).resolves.toBeUndefined()
    expect(prismaMock.wish.delete).not.toHaveBeenCalled()
  })

  it("returns the current user's wishes as display books", async () => {
    const books = [{ id: 12 }]
    const mappedBooks = [{ isbn: "9780000000001", title: "The Example" }]
    prismaMock.wish.findMany.mockResolvedValue([{ book: books[0] }])
    mapBooksMock.mockReturnValue(mappedBooks)

    await expect(getUserWishBooks("reader-1")).resolves.toBe(mappedBooks)
    expect(prismaMock.wish.findMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
      include: { book: true },
      orderBy: { createdAt: "desc" },
    })
    expect(mapBooksMock).toHaveBeenCalledWith(books)
  })
})
