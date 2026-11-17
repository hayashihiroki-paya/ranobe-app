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
  getAuthenticatedUserIdMock,
  unauthorizedResponseMock,
  buildUserVectorMock,
  calculateScoreMock,
} = vi.hoisted(() => ({
  prismaMock: {
    book: { findUnique: vi.fn() },
    userBookTag: { groupBy: vi.fn() },
    tag: { findMany: vi.fn() },
  },
  getAuthenticatedUserIdMock: vi.fn(),
  unauthorizedResponseMock: vi.fn(
    () =>
      new Response(JSON.stringify({ message: "ログインが必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  ),
  buildUserVectorMock: vi.fn(),
  calculateScoreMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/api/auth", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
  unauthorizedResponse: unauthorizedResponseMock,
}));
vi.mock("@/lib/api/recommend/buildUserVector", () => ({
  buildUserVector: buildUserVectorMock,
}));
vi.mock("@/lib/api/recommend/calculateScore", () => ({
  calculateScore: calculateScoreMock,
}));

import type { NextRequest } from "next/server";
import { GET } from "./route";

const isbn = "9780000000001";
const request = new Request(
  `http://localhost/api/books/${isbn}/recommend-detail`,
) as NextRequest;
const context = { params: Promise.resolve({ isbn }) };

describe("GET /api/books/[isbn]/recommend-detail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1");
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects unauthenticated requests before loading book data", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    const response = await GET(request, context);

    expect(response.status).toBe(401);
    expect(prismaMock.book.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when the book is not in the database", async () => {
    prismaMock.book.findUnique.mockResolvedValue(null);

    const response = await GET(request, context);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toBeNull();
    expect(buildUserVectorMock).not.toHaveBeenCalled();
    expect(prismaMock.userBookTag.groupBy).not.toHaveBeenCalled();
  });

  it("returns weighted tag matches and a rounded similarity score", async () => {
    prismaMock.book.findUnique.mockResolvedValue({ id: 42 });
    buildUserVectorMock.mockResolvedValue([
      { tagId: "fantasy", score: 2 },
      { tagId: "mystery", score: 1 },
    ]);
    prismaMock.userBookTag.groupBy.mockResolvedValue([
      { tagId: "fantasy", _count: { tagId: 3 } },
      { tagId: "mystery", _count: { tagId: 1 } },
      { tagId: "romance", _count: { tagId: 2 } },
    ]);
    prismaMock.tag.findMany.mockResolvedValue([
      { id: "fantasy", name: "Fantasy" },
      { id: "mystery", name: "Mystery" },
      { id: "romance", name: "Romance" },
    ]);
    calculateScoreMock.mockReturnValue({ score: 0.876, matchCount: 2 });

    const response = await GET(request, context);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      score: 88,
      matchCount: 2,
      matchedTags: [
        {
          tagId: "fantasy",
          tagName: "Fantasy",
          userCount: 2,
          bookCount: 3,
          userWeight: 2,
          bookWeight: 3,
        },
        {
          tagId: "mystery",
          tagName: "Mystery",
          userCount: 1,
          bookCount: 1,
          userWeight: 1,
          bookWeight: 1,
        },
      ],
      userTagStats: [
        { tagId: "fantasy", tagName: "Fantasy", count: 2 },
        { tagId: "mystery", tagName: "Mystery", count: 1 },
      ],
      bookTagStats: [
        { tagId: "fantasy", tagName: "Fantasy", count: 3 },
        { tagId: "mystery", tagName: "Mystery", count: 1 },
        { tagId: "romance", tagName: "Romance", count: 2 },
      ],
    });
    expect(prismaMock.book.findUnique).toHaveBeenCalledWith({
      where: { isbn },
      select: { id: true },
    });
    expect(buildUserVectorMock).toHaveBeenCalledWith("reader-1");
    expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["fantasy", "mystery", "romance"] } },
    });
  });

  it("returns a server error when recommendation details fail to load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.book.findUnique.mockRejectedValue(
      new Error("database unavailable"),
    );

    const response = await GET(request, context);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toBeNull();
  });
});
