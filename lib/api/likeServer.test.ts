import { beforeEach, describe, expect, it, vi } from "vitest"

const { prismaMock, transactionMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    book: { findUnique: vi.fn() },
    like: { delete: vi.fn(), findMany: vi.fn() },
  },
  transactionMock: {
    book: { findUnique: vi.fn(), create: vi.fn() },
    like: { upsert: vi.fn() },
  },
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

import {
  createUserLike,
  deleteUserLikeByIsbn,
  getUserLikeIsbns,
} from "./likeServer"

describe("like server operations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(transactionMock)
    )
    transactionMock.book.findUnique.mockResolvedValue({ id: 12 })
    transactionMock.like.upsert.mockResolvedValue({ id: 34 })
  })

  it("creates or finds the book and upserts the user's like in one transaction", async () => {
    const input = {
      isbn: "9780000000001",
      title: "The Example",
      author: "A. Writer",
    }

    await expect(createUserLike("reader-1", input)).resolves.toEqual({ id: 34 })
    expect(prismaMock.$transaction).toHaveBeenCalledOnce()
    expect(transactionMock.book.findUnique).toHaveBeenCalledWith({
      where: { isbn: input.isbn },
    })
    expect(transactionMock.like.upsert).toHaveBeenCalledWith({
      where: { userId_bookId: { userId: "reader-1", bookId: 12 } },
      update: {},
      create: { userId: "reader-1", bookId: 12 },
    })
  })

  it("deletes the user's like for an existing ISBN", async () => {
    prismaMock.book.findUnique.mockResolvedValue({ id: 12 })

    await deleteUserLikeByIsbn("reader-1", "9780000000001")

    expect(prismaMock.book.findUnique).toHaveBeenCalledWith({
      where: { isbn: "9780000000001" },
    })
    expect(prismaMock.like.delete).toHaveBeenCalledWith({
      where: { userId_bookId: { userId: "reader-1", bookId: 12 } },
    })
  })

  it("does nothing when the ISBN is not in the database", async () => {
    prismaMock.book.findUnique.mockResolvedValue(null)

    await expect(
      deleteUserLikeByIsbn("reader-1", "unknown")
    ).resolves.toBeUndefined()
    expect(prismaMock.like.delete).not.toHaveBeenCalled()
  })

  it("returns only the current user's liked ISBNs", async () => {
    prismaMock.like.findMany.mockResolvedValue([
      { book: { isbn: "9780000000001" } },
      { book: { isbn: "9780000000002" } },
    ])

    await expect(getUserLikeIsbns("reader-1")).resolves.toEqual([
      "9780000000001",
      "9780000000002",
    ])
    expect(prismaMock.like.findMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
      include: { book: { select: { isbn: true } } },
    })
  })
})
