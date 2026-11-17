import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { prismaMock, getAuthenticatedUserIdMock, unauthorizedResponseMock } =
  vi.hoisted(() => ({
    prismaMock: {
      book: { findUnique: vi.fn() },
      userBookTag: { findMany: vi.fn() },
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

describe("GET /api/user-book-tags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1");
  });
  afterEach(() => vi.restoreAllMocks());

  it("requires an authenticated user before querying the database", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost/api/user-book-tags?isbn=9780000000001"),
    );

    expect(response.status).toBe(401);
    expect(unauthorizedResponseMock).toHaveBeenCalledOnce();
    expect(prismaMock.book.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a missing ISBN without querying the database", async () => {
    const response = await GET(
      new Request("http://localhost/api/user-book-tags"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "isbn が必要です",
    });
    expect(prismaMock.book.findUnique).not.toHaveBeenCalled();
  });

  it("returns an empty list when the book is not in the database", async () => {
    prismaMock.book.findUnique.mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost/api/user-book-tags?isbn=9780000000001"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
    expect(prismaMock.book.findUnique).toHaveBeenCalledWith({
      where: { isbn: "9780000000001" },
      select: { id: true },
    });
    expect(prismaMock.userBookTag.findMany).not.toHaveBeenCalled();
  });

  it("returns tag IDs for the authenticated user's book", async () => {
    prismaMock.book.findUnique.mockResolvedValue({ id: 42 });
    prismaMock.userBookTag.findMany.mockResolvedValue([
      { tagId: "fantasy" },
      { tagId: "found-family" },
    ]);

    const response = await GET(
      new Request("http://localhost/api/user-book-tags?isbn=9780000000001"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(["fantasy", "found-family"]);
    expect(prismaMock.userBookTag.findMany).toHaveBeenCalledWith({
      where: { userId: "reader-1", bookId: 42 },
      select: { tagId: true },
    });
  });

  it("returns a server error when database access fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.book.findUnique.mockRejectedValue(
      new Error("database unavailable"),
    );

    const response = await GET(
      new Request("http://localhost/api/user-book-tags?isbn=9780000000001"),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "タグ取得失敗" });
  });
});
