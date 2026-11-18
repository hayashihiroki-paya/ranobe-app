import { beforeEach, describe, expect, it, vi } from "vitest"

const { prismaMock, transactionClientMock } = vi.hoisted(() => ({
  prismaMock: { $transaction: vi.fn() },
  transactionClientMock: {
    userBookTag: { deleteMany: vi.fn() },
    userTagScore: { deleteMany: vi.fn() },
    likeRank: { deleteMany: vi.fn() },
    like: { deleteMany: vi.fn() },
    wish: { deleteMany: vi.fn() },
    account: { deleteMany: vi.fn() },
    session: { deleteMany: vi.fn() },
    user: { delete: vi.fn() },
  },
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

import { deleteUserAccount } from "./accountServer"

describe("deleteUserAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    transactionClientMock.userBookTag.deleteMany.mockResolvedValue({ count: 1 })
    transactionClientMock.userTagScore.deleteMany.mockResolvedValue({ count: 1 })
    transactionClientMock.likeRank.deleteMany.mockResolvedValue({ count: 1 })
    transactionClientMock.like.deleteMany.mockResolvedValue({ count: 1 })
    transactionClientMock.wish.deleteMany.mockResolvedValue({ count: 1 })
    transactionClientMock.account.deleteMany.mockResolvedValue({ count: 1 })
    transactionClientMock.session.deleteMany.mockResolvedValue({ count: 1 })
    transactionClientMock.user.delete.mockResolvedValue({ id: "reader-1" })
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof transactionClientMock) => Promise<unknown>) =>
        callback(transactionClientMock),
    )
  })

  it("removes all personal relations and the user in one transaction", async () => {
    await deleteUserAccount("reader-1")

    expect(prismaMock.$transaction).toHaveBeenCalledOnce()
    expect(transactionClientMock.userBookTag.deleteMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
    })
    expect(transactionClientMock.userTagScore.deleteMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
    })
    expect(transactionClientMock.likeRank.deleteMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
    })
    expect(transactionClientMock.like.deleteMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
    })
    expect(transactionClientMock.wish.deleteMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
    })
    expect(transactionClientMock.account.deleteMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
    })
    expect(transactionClientMock.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
    })
    expect(transactionClientMock.user.delete).toHaveBeenCalledWith({
      where: { id: "reader-1" },
    })
  })

  it("stops before deleting the user if a related-data deletion fails", async () => {
    const error = new Error("database unavailable")
    transactionClientMock.wish.deleteMany.mockRejectedValue(error)

    await expect(deleteUserAccount("reader-1")).rejects.toBe(error)
    expect(transactionClientMock.user.delete).not.toHaveBeenCalled()
  })
})
