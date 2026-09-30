import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    userBookTag: { groupBy: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { buildBookVectors } from "./buildBookVectors";

describe("buildBookVectors", () => {
  beforeEach(() => vi.clearAllMocks());

  it("groups tag counts into per-book vectors and excludes supplied book ids", async () => {
    prismaMock.userBookTag.groupBy.mockResolvedValue([
      { bookId: 4, tagId: "fantasy", _count: { tagId: 3 } },
      { bookId: 4, tagId: "adventure", _count: { tagId: 1 } },
      { bookId: 9, tagId: "fantasy", _count: { tagId: 2 } },
    ]);

    const result = await buildBookVectors([2, 8]);

    expect(prismaMock.userBookTag.groupBy).toHaveBeenCalledWith({
      by: ["bookId", "tagId"],
      where: { bookId: { notIn: [2, 8] } },
      _count: { tagId: true },
    });
    expect(Array.from(result.entries())).toEqual([
      [
        4,
        [
          { tagId: "fantasy", count: 3 },
          { tagId: "adventure", count: 1 },
        ],
      ],
      [9, [{ tagId: "fantasy", count: 2 }]],
    ]);
  });

  it("omits the exclusion filter for an empty list and returns an empty map when no rows exist", async () => {
    prismaMock.userBookTag.groupBy.mockResolvedValue([]);

    const result = await buildBookVectors([]);

    expect(prismaMock.userBookTag.groupBy).toHaveBeenCalledWith({
      by: ["bookId", "tagId"],
      where: { bookId: { notIn: undefined } },
      _count: { tagId: true },
    });
    expect(result.size).toBe(0);
  });
});
