import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    userBookTag: { findMany: vi.fn() },
    userTagScore: { findMany: vi.fn() },
    user: { findMany: vi.fn() },
    tag: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { getSimilarUsers } from "./similarUsers";

describe("getSimilarUsers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("merges tag usage and scores, excludes the current user, ranks candidates, and maps top tags", async () => {
    prismaMock.userBookTag.findMany.mockResolvedValue([
      { userId: "me", tagId: "a" },
      { userId: "me", tagId: "b" },
      { userId: "me", tagId: "c" },
      { userId: "u1", tagId: "a" },
      { userId: "u1", tagId: "b" },
      { userId: "u1", tagId: "c" },
      { userId: "u1", tagId: "d" },
      { userId: "u2", tagId: "a" },
      { userId: "u2", tagId: "b" },
      { userId: "u2", tagId: "c" },
      { userId: "u2", tagId: "d" },
      { userId: "u2", tagId: "e" },
      { userId: "u3", tagId: "a" },
      { userId: "u3", tagId: "b" },
      { userId: "u3", tagId: "c" },
      { userId: "u4", tagId: "a" },
      { userId: "u4", tagId: "b" },
      { userId: "u4", tagId: "c" },
      { userId: "u5", tagId: "a" },
      { userId: "u5", tagId: "b" },
      { userId: "u5", tagId: "c" },
      { userId: "u6", tagId: "a" },
      { userId: "u6", tagId: "b" },
      { userId: "u6", tagId: "c" },
      { userId: "me", tagId: "a" },
    ]);
    prismaMock.userTagScore.findMany.mockResolvedValue([
      { userId: "me", tagId: "a", score: 2 },
      { userId: "u1", tagId: "a", score: 10 },
      { userId: "u1", tagId: "b", score: 1 },
      { userId: "u1", tagId: "untranslated", score: 5 },
    ]);
    prismaMock.user.findMany.mockResolvedValue([
      { id: "u1", name: null },
      { id: "u2", name: "Second" },
      { id: "u3", name: "Third" },
      { id: "u4", name: "Fourth" },
      { id: "u5", name: "Fifth" },
      { id: "u6", name: "Sixth" },
    ]);
    prismaMock.tag.findMany.mockResolvedValue([
      { id: "a", name: "Adventure" },
      { id: "b", name: "Fantasy" },
    ]);

    const result = await getSimilarUsers("me");

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: { NOT: { id: "me" } },
      select: { id: true, name: true },
    });
    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({
      id: "u1",
      name: "ユーザー",
      score: 100,
      tags: ["Adventure", "", "Fantasy"],
    });
    expect(result.slice(1).map(({ id }) => id)).toEqual([
      "u3",
      "u4",
      "u5",
      "u6",
    ]);
    expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["a", "untranslated", "b", "c"] } },
    });
  });

  it("filters candidates with fewer than two common tags and candidates below the score threshold", async () => {
    const mine = Array.from({ length: 6 }, (_, index) => ({
      userId: "me",
      tagId: `mine-${index}`,
    }));
    const barelyOverlapping = [
      { userId: "one-common", tagId: "mine-0" },
      ...Array.from({ length: 599 }, (_, index) => ({
        userId: "below-threshold",
        tagId: `other-${index}`,
      })),
      { userId: "below-threshold", tagId: "mine-0" },
      { userId: "below-threshold", tagId: "mine-1" },
    ];
    prismaMock.userBookTag.findMany.mockResolvedValue([
      ...mine,
      ...barelyOverlapping,
    ]);
    prismaMock.userTagScore.findMany.mockResolvedValue([]);
    prismaMock.user.findMany.mockResolvedValue([
      { id: "one-common", name: "One" },
      { id: "below-threshold", name: "Weak" },
    ]);
    prismaMock.tag.findMany.mockResolvedValue([]);

    await expect(getSimilarUsers("me")).resolves.toEqual([]);
    expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
      where: { id: { in: [] } },
    });
  });

  it("keeps a candidate whose similarity reaches the 0.1 minimum", async () => {
    const currentTags = Array.from({ length: 6 }, (_, index) => ({
      userId: "me",
      tagId: `mine-${index}`,
    }));
    const candidateTags = [
      { userId: "boundary", tagId: "mine-0" },
      { userId: "boundary", tagId: "mine-1" },
      ...Array.from({ length: 598 }, (_, index) => ({
        userId: "boundary",
        tagId: `other-${index}`,
      })),
    ];
    prismaMock.userBookTag.findMany.mockResolvedValue([
      ...currentTags,
      ...candidateTags,
    ]);
    prismaMock.userTagScore.findMany.mockResolvedValue([]);
    prismaMock.user.findMany.mockResolvedValue([
      { id: "boundary", name: "Boundary" },
    ]);
    prismaMock.tag.findMany.mockResolvedValue([]);

    await expect(getSimilarUsers("me")).resolves.toEqual([
      {
        id: "boundary",
        name: "Boundary",
        score: 10,
        tags: ["", "", ""],
      },
    ]);
  });

  it("returns an empty list when there are no other users", async () => {
    prismaMock.userBookTag.findMany.mockResolvedValue([]);
    prismaMock.userTagScore.findMany.mockResolvedValue([]);
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.tag.findMany.mockResolvedValue([]);

    await expect(getSimilarUsers("me")).resolves.toEqual([]);
    expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
      where: { id: { in: [] } },
    });
  });
});
