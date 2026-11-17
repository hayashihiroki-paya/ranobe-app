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
    like: { findUnique: vi.fn() },
    likeRank: { upsert: vi.fn() },
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

import { PATCH } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/like-rank", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/like-rank", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1");
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof transactionClientMock) => Promise<unknown>) =>
        callback(transactionClientMock),
    );
    transactionClientMock.like.findUnique.mockResolvedValue({ id: 1 });
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects unauthenticated requests without starting a transaction", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    const response = await PATCH(request([{ bookId: 1, rank: 1 }]));

    expect(response.status).toBe(401);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects invalid ranking input before starting a transaction", async () => {
    const response = await PATCH(request([{ bookId: "invalid", rank: 1 }]));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "配列で送ってください",
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("upserts every ranking after verifying the user's likes", async () => {
    const response = await PATCH(
      request([
        { bookId: 10, rank: 1 },
        { bookId: 20, rank: 2 },
      ]),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(transactionClientMock.like.findUnique).toHaveBeenNthCalledWith(1, {
      where: { userId_bookId: { userId: "reader-1", bookId: 10 } },
    });
    expect(transactionClientMock.like.findUnique).toHaveBeenNthCalledWith(2, {
      where: { userId_bookId: { userId: "reader-1", bookId: 20 } },
    });
    expect(transactionClientMock.likeRank.upsert).toHaveBeenNthCalledWith(1, {
      where: { userId_bookId: { userId: "reader-1", bookId: 10 } },
      update: { rank: 1 },
      create: { userId: "reader-1", bookId: 10, rank: 1 },
    });
    expect(transactionClientMock.likeRank.upsert).toHaveBeenNthCalledWith(2, {
      where: { userId_bookId: { userId: "reader-1", bookId: 20 } },
      update: { rank: 2 },
      create: { userId: "reader-1", bookId: 20, rank: 2 },
    });
  });

  it("returns a server error when a ranked book is not liked by the user", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    transactionClientMock.like.findUnique.mockResolvedValue(null);

    const response = await PATCH(request([{ bookId: 10, rank: 1 }]));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "ランキング更新に失敗しました",
    });
    expect(transactionClientMock.likeRank.upsert).not.toHaveBeenCalled();
  });
});
