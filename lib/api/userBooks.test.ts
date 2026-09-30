import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    like: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { getUserLikedBooks } from "./userBooks";

describe("getUserLikedBooks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requests the 12 newest likes and maps their book fields", async () => {
    prismaMock.like.findMany.mockResolvedValue([
      {
        book: {
          isbn: "new-isbn",
          title: "Newest",
          largeImageUrl: "https://images.example/new.jpg",
          author: "New Writer",
        },
      },
      {
        book: {
          isbn: "old-isbn",
          title: "Older",
          largeImageUrl: null,
          author: "Old Writer",
        },
      },
    ]);

    await expect(getUserLikedBooks("reader-1")).resolves.toEqual([
      {
        isbn: "new-isbn",
        title: "Newest",
        largeImageUrl: "https://images.example/new.jpg",
        author: "New Writer",
      },
      {
        isbn: "old-isbn",
        title: "Older",
        largeImageUrl: undefined,
        author: "Old Writer",
      },
    ]);
    expect(prismaMock.like.findMany).toHaveBeenCalledWith({
      where: { userId: "reader-1" },
      include: { book: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  });

  it("returns an empty list when no liked books are found", async () => {
    prismaMock.like.findMany.mockResolvedValue([]);

    await expect(getUserLikedBooks("reader-empty")).resolves.toEqual([]);
  });
});
