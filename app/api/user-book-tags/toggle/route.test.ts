import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  prismaMock,
  transactionClientMock,
  getAuthenticatedUserIdMock,
  unauthorizedResponseMock,
} = vi.hoisted(() => ({
  prismaMock: { $transaction: vi.fn() },
  transactionClientMock: {
    book: { findUnique: vi.fn() },
    userBookTag: {
      findFirst: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
    userTagScore: {
      updateMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
  getAuthenticatedUserIdMock: vi.fn(),
  unauthorizedResponseMock: vi.fn(
    () =>
      new Response(JSON.stringify({ message: "ログインが必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  ),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/api/auth", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
  unauthorizedResponse: unauthorizedResponseMock,
}));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/user-book-tags/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validInput = { isbn: "9780000000001", tagId: "fantasy" };

describe("POST /api/user-book-tags/toggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1");
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof transactionClientMock) => Promise<unknown>) =>
        callback(transactionClientMock),
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects unauthenticated requests without starting a transaction", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    const response = await POST(request(validInput));

    expect(response.status).toBe(401);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("validates ISBN and tag ID before starting a transaction", async () => {
    const response = await POST(request({ isbn: "", tagId: "fantasy" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "isbn と tagId が必要です",
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns not found when the book does not exist", async () => {
    transactionClientMock.book.findUnique.mockResolvedValue(null);

    const response = await POST(request(validInput));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Bookが存在しません（Likeされていない可能性）",
    });
    expect(transactionClientMock.userBookTag.findFirst).not.toHaveBeenCalled();
  });

  it("removes an existing tag and decrements its score", async () => {
    transactionClientMock.book.findUnique.mockResolvedValue({ id: 42 });
    transactionClientMock.userBookTag.findFirst.mockResolvedValue({
      id: "tag-link-1",
    });

    const response = await POST(request(validInput));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "removed" });
    expect(transactionClientMock.userBookTag.delete).toHaveBeenCalledWith({
      where: { id: "tag-link-1" },
    });
    expect(transactionClientMock.userTagScore.updateMany).toHaveBeenCalledWith({
      where: { userId: "reader-1", tagId: "fantasy" },
      data: { score: { decrement: 1 } },
    });
  });

  it("adds a new tag and increments its score", async () => {
    transactionClientMock.book.findUnique.mockResolvedValue({ id: 42 });
    transactionClientMock.userBookTag.findFirst.mockResolvedValue(null);

    const response = await POST(request(validInput));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "added" });
    expect(transactionClientMock.userBookTag.create).toHaveBeenCalledWith({
      data: { userId: "reader-1", bookId: 42, tagId: "fantasy", score: 1 },
    });
    expect(transactionClientMock.userTagScore.upsert).toHaveBeenCalledWith({
      where: { userId_tagId: { userId: "reader-1", tagId: "fantasy" } },
      update: { score: { increment: 1 } },
      create: { userId: "reader-1", tagId: "fantasy", score: 1 },
    });
  });

  it("returns a server error when the transaction fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.$transaction.mockRejectedValue(
      new Error("database unavailable"),
    );

    const response = await POST(request(validInput));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "タグ操作に失敗しました",
    });
  });
});
