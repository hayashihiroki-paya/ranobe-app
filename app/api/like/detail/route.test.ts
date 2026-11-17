import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getAuthenticatedUserIdMock, unauthorizedResponseMock } =
  vi.hoisted(() => ({
    prismaMock: {
      like: { findMany: vi.fn() },
      likeRank: { findMany: vi.fn() },
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

import { GET } from "./route";

describe("GET /api/like/detail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1");
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects unauthenticated requests before querying likes", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(prismaMock.like.findMany).not.toHaveBeenCalled();
  });

  it("attaches ranks and sorts ranked books before unranked books", async () => {
    prismaMock.like.findMany.mockResolvedValue([
      { bookId: 1, book: { isbn: "unranked-1", title: "Unranked One" } },
      { bookId: 2, book: { isbn: "ranked-2", title: "Ranked Two" } },
      { bookId: 3, book: { isbn: "ranked-1", title: "Ranked One" } },
      { bookId: 4, book: { isbn: "unranked-2", title: "Unranked Two" } },
    ]);
    prismaMock.likeRank.findMany.mockResolvedValue([
      { bookId: 2, rank: 2 },
      { bookId: 3, rank: 1 },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        isbn: "ranked-1",
        title: "Ranked One",
        rank: 1,
        isRanked: true,
      },
      {
        isbn: "ranked-2",
        title: "Ranked Two",
        rank: 2,
        isRanked: true,
      },
      {
        isbn: "unranked-1",
        title: "Unranked One",
        rank: null,
        isRanked: false,
      },
      {
        isbn: "unranked-2",
        title: "Unranked Two",
        rank: null,
        isRanked: false,
      },
    ]);
    expect(prismaMock.like.findMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
      include: { book: true },
    });
    expect(prismaMock.likeRank.findMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
    });
  });

  it("returns a server error when the ranking lookup fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.like.findMany.mockResolvedValue([]);
    prismaMock.likeRank.findMany.mockRejectedValue(
      new Error("database unavailable"),
    );

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
  });
});
