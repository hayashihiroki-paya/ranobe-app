import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getAuthenticatedUserIdMock, unauthorizedResponseMock } =
  vi.hoisted(() => ({
    prismaMock: { like: { findMany: vi.fn() } },
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

describe("GET /api/like/bookshelf", () => {
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

  it("returns mapped books ordered by most recently liked", async () => {
    prismaMock.like.findMany.mockResolvedValue([
      {
        book: {
          isbn: "9780000000001",
          title: "The Example",
          author: "A. Writer",
          largeImageUrl: null,
          itemCaption: null,
        },
      },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        isbn: "9780000000001",
        title: "The Example",
        author: "A. Writer",
      },
    ]);
    expect(prismaMock.like.findMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
      include: { book: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns a server error when the bookshelf lookup fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.like.findMany.mockRejectedValue(
      new Error("database unavailable"),
    );

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
  });
});
