import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, buildUserVectorMock, buildBookVectorsMock, calculateScoreMock } =
  vi.hoisted(() => ({
    prismaMock: {
      like: { findMany: vi.fn() },
      book: { findMany: vi.fn() },
    },
    buildUserVectorMock: vi.fn(),
    buildBookVectorsMock: vi.fn(),
    calculateScoreMock: vi.fn(),
  }));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("./buildUserVector", () => ({
  buildUserVector: buildUserVectorMock,
}));
vi.mock("./buildBookVectors", () => ({
  buildBookVectors: buildBookVectorsMock,
}));
vi.mock("./calculateScore", () => ({
  calculateScore: calculateScoreMock,
}));

import { getRecommendBooks } from "./getRecommendBooks";

describe("getRecommendBooks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("short-circuits when the user vector is empty", async () => {
    buildUserVectorMock.mockResolvedValue([]);

    await expect(getRecommendBooks("reader-1")).resolves.toEqual([]);
    expect(buildBookVectorsMock).not.toHaveBeenCalled();
    expect(prismaMock.like.findMany).not.toHaveBeenCalled();
    expect(prismaMock.book.findMany).not.toHaveBeenCalled();
  });

  it("filters unscorable books, ranks by score, caps at 20, and maps details in ranking order", async () => {
    const vector = [{ tagId: "fantasy", score: 2 }];
    const bookVectors = new Map<number, { tagId: string; count: number }[]>();
    for (let id = 1; id <= 22; id++) {
      bookVectors.set(id, [{ tagId: "fantasy", count: id }]);
    }
    bookVectors.set(99, [{ tagId: "unmatched", count: 99 }]);
    buildUserVectorMock.mockResolvedValue(vector);
    prismaMock.like.findMany.mockResolvedValue([{ bookId: 900 }]);
    buildBookVectorsMock.mockResolvedValue(bookVectors);
    calculateScoreMock.mockImplementation(
      (_userTags: unknown, tags: { count: number }[]) =>
        tags[0]?.count === 99
          ? null
          : {
              score: tags[0]?.count === 22 ? 1.239 : tags[0].count / 100,
              matchCount: tags[0].count,
            },
    );
    prismaMock.book.findMany.mockResolvedValue([
      {
        id: 3,
        isbn: "isbn-3",
        title: "Book 3",
        author: "Writer 3",
        largeImageUrl: "image-3",
        itemCaption: "caption-3",
      },
      {
        id: 22,
        isbn: null,
        title: null,
        author: null,
        largeImageUrl: null,
        itemCaption: null,
      },
    ]);

    const results = await getRecommendBooks("reader-1");

    expect(prismaMock.like.findMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
      select: { bookId: true },
    });
    expect(buildBookVectorsMock).toHaveBeenCalledWith([900]);
    expect(calculateScoreMock).toHaveBeenCalledTimes(23);
    expect(prismaMock.book.findMany).toHaveBeenCalledWith({
      where: { id: { in: Array.from({ length: 20 }, (_, index) => 22 - index) } },
    });
    expect(results).toHaveLength(20);
    expect(results.map((result) => result.bookId)).toEqual(
      Array.from({ length: 20 }, (_, index) => 22 - index),
    );
    expect(results[0]).toEqual({
      bookId: 22,
      isbn: "",
      title: "",
      author: "",
      largeImageUrl: "",
      itemCaption: "",
      matchCount: 22,
      score: 124,
    });
    expect(results[1]).toEqual({
      bookId: 21,
      isbn: "",
      title: "",
      author: "",
      largeImageUrl: "",
      itemCaption: "",
      matchCount: 21,
      score: 21,
    });
    expect(results[19]).toEqual({
      bookId: 3,
      isbn: "isbn-3",
      title: "Book 3",
      author: "Writer 3",
      largeImageUrl: "image-3",
      itemCaption: "caption-3",
      matchCount: 3,
      score: 3,
    });
  });

  it("returns an empty result for an empty candidate map", async () => {
    buildUserVectorMock.mockResolvedValue([{ tagId: "fantasy", score: 1 }]);
    prismaMock.like.findMany.mockResolvedValue([]);
    buildBookVectorsMock.mockResolvedValue(new Map());
    prismaMock.book.findMany.mockResolvedValue([]);

    await expect(getRecommendBooks("reader-2")).resolves.toEqual([]);
    expect(prismaMock.book.findMany).toHaveBeenCalledWith({
      where: { id: { in: [] } },
    });
  });
});
