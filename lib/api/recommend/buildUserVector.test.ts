import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    userTagScore: { findMany: vi.fn() },
    like: { findMany: vi.fn() },
    bookTag: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { buildUserVector } from "./buildUserVector";

describe("buildUserVector", () => {
  beforeEach(() => vi.clearAllMocks());

  it("adds twice each liked-book tag strength to saved scores and includes new tags", async () => {
    prismaMock.userTagScore.findMany.mockResolvedValue([
      { tagId: "fantasy", score: 1.5 },
      { tagId: "adventure", score: -1 },
      { tagId: "fantasy", score: 2 },
    ]);
    prismaMock.like.findMany.mockResolvedValue([
      { bookId: 4 },
      { bookId: 9 },
    ]);
    prismaMock.bookTag.findMany.mockResolvedValue([
      { tagId: "fantasy", strength: 0.25 },
      { tagId: "adventure", strength: 0.5 },
      { tagId: "romance", strength: 1 },
      { tagId: "romance", strength: 0.25 },
    ]);

    const result = await buildUserVector("reader-1");

    expect(prismaMock.userTagScore.findMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
      select: { tagId: true, score: true },
    });
    expect(prismaMock.like.findMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
      select: { bookId: true },
    });
    expect(prismaMock.bookTag.findMany).toHaveBeenCalledWith({
      where: { bookId: { in: [4, 9] } },
      select: { tagId: true, strength: true },
    });
    expect(result).toEqual([
      { tagId: "fantasy", score: 2.5 },
      { tagId: "adventure", score: 0 },
      { tagId: "romance", score: 2.5 },
    ]);
  });

  it("returns score rows without querying book tags when the user has no likes", async () => {
    prismaMock.userTagScore.findMany.mockResolvedValue([
      { tagId: "mystery", score: 3 },
    ]);
    prismaMock.like.findMany.mockResolvedValue([]);

    await expect(buildUserVector("reader-2")).resolves.toEqual([
      { tagId: "mystery", score: 3 },
    ]);
    expect(prismaMock.bookTag.findMany).not.toHaveBeenCalled();
  });

  it("returns an empty vector when there are no saved scores or liked books", async () => {
    prismaMock.userTagScore.findMany.mockResolvedValue([]);
    prismaMock.like.findMany.mockResolvedValue([]);

    await expect(buildUserVector("reader-empty")).resolves.toEqual([]);
    expect(prismaMock.bookTag.findMany).not.toHaveBeenCalled();
  });
});
