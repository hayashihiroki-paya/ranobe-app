import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    userBookTag: { groupBy: vi.fn(), findMany: vi.fn() },
    userTagScore: { findMany: vi.fn() },
    like: { count: vi.fn() },
    tag: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { getUserStats, getUserTagStats } from "./profile";

describe("profile library functions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("merges usage and scores, ranks the top five, and supplies a fallback for missing tag rows", async () => {
    prismaMock.userBookTag.groupBy.mockResolvedValue([
      { tagId: "a", _count: { tagId: 3 } },
      { tagId: "b", _count: { tagId: 2 } },
      { tagId: "c", _count: { tagId: 1 } },
      { tagId: "d", _count: { tagId: 1 } },
      { tagId: "e", _count: { tagId: 1 } },
      { tagId: "f", _count: { tagId: 1 } },
    ]);
    prismaMock.userTagScore.findMany.mockResolvedValue([
      { tagId: "a", score: 2 },
      { tagId: "c", score: 4 },
      { tagId: "g", score: 3 },
    ]);
    prismaMock.tag.findMany.mockResolvedValue([
      { id: "c", name: "Fantasy" },
      { id: "a", name: "Adventure" },
      { id: "g", name: "Mystery" },
    ]);

    await expect(getUserTagStats("reader-1")).resolves.toEqual([
      { name: "Adventure", count: 5 },
      { name: "Fantasy", count: 5 },
      { name: "Mystery", count: 3 },
      { name: "不明", count: 2 },
      { name: "不明", count: 1 },
    ]);
    expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["a", "c", "g", "b", "d"] } },
    });
  });

  it("returns no tag stats and requests no tag details when both sources are empty", async () => {
    prismaMock.userBookTag.groupBy.mockResolvedValue([]);
    prismaMock.userTagScore.findMany.mockResolvedValue([]);
    prismaMock.tag.findMany.mockResolvedValue([]);

    await expect(getUserTagStats("reader-empty")).resolves.toEqual([]);
    expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
      where: { id: { in: [] } },
    });
  });

  it("counts likes and distinct tags across usage and score records", async () => {
    prismaMock.like.count.mockResolvedValue(4);
    prismaMock.userBookTag.findMany.mockResolvedValue([
      { tagId: "fantasy" },
      { tagId: "mystery" },
      { tagId: "fantasy" },
    ]);
    prismaMock.userTagScore.findMany.mockResolvedValue([
      { tagId: "mystery" },
      { tagId: "romance" },
    ]);

    await expect(getUserStats("reader-2")).resolves.toEqual({
      likeCount: 4,
      tagCount: 3,
    });
  });

  it("returns zero counts when a user has no likes or tags", async () => {
    prismaMock.like.count.mockResolvedValue(0);
    prismaMock.userBookTag.findMany.mockResolvedValue([]);
    prismaMock.userTagScore.findMany.mockResolvedValue([]);

    await expect(getUserStats("reader-empty")).resolves.toEqual({
      likeCount: 0,
      tagCount: 0,
    });
  });
});
