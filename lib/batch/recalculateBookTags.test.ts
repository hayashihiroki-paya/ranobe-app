import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    book: { findMany: vi.fn() },
    userBookTag: { groupBy: vi.fn() },
    bookTag: { deleteMany: vi.fn(), createMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { recalculateBookTags } from "./recalculateBookTags";

describe("recalculateBookTags", () => {
  beforeEach(() => vi.clearAllMocks());

  it("recalculates one requested book using the five most common tags and shares of all tag uses", async () => {
    prismaMock.userBookTag.groupBy.mockResolvedValue([
      { tagId: "a", _count: { tagId: 6 } },
      { tagId: "b", _count: { tagId: 5 } },
      { tagId: "c", _count: { tagId: 4 } },
      { tagId: "d", _count: { tagId: 3 } },
      { tagId: "e", _count: { tagId: 2 } },
      { tagId: "f", _count: { tagId: 1 } },
    ]);

    await expect(recalculateBookTags(7)).resolves.toEqual({
      updatedCount: 1,
      totalBooks: 1,
    });
    expect(prismaMock.book.findMany).not.toHaveBeenCalled();
    expect(prismaMock.userBookTag.groupBy).toHaveBeenCalledWith({
      by: ["tagId"],
      where: { bookId: 7 },
      _count: { tagId: true },
      orderBy: { _count: { tagId: "desc" } },
    });
    expect(prismaMock.bookTag.deleteMany).toHaveBeenCalledWith({
      where: { bookId: 7 },
    });
    expect(prismaMock.bookTag.createMany).toHaveBeenCalledWith({
      data: [
        { bookId: 7, tagId: "a", strength: 6 / 21 },
        { bookId: 7, tagId: "b", strength: 5 / 21 },
        { bookId: 7, tagId: "c", strength: 4 / 21 },
        { bookId: 7, tagId: "d", strength: 3 / 21 },
        { bookId: 7, tagId: "e", strength: 2 / 21 },
      ],
    });
  });

  it("leaves existing tags untouched for books with no usage and reports all processed books", async () => {
    prismaMock.book.findMany.mockResolvedValue([{ id: 2 }, { id: 3 }]);
    prismaMock.userBookTag.groupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { tagId: "mystery", _count: { tagId: 2 } },
      ]);

    await expect(recalculateBookTags()).resolves.toEqual({
      updatedCount: 1,
      totalBooks: 2,
    });
    expect(prismaMock.book.findMany).toHaveBeenCalledWith({
      select: { id: true },
    });
    expect(prismaMock.bookTag.deleteMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.bookTag.deleteMany).toHaveBeenCalledWith({
      where: { bookId: 3 },
    });
    expect(prismaMock.bookTag.createMany).toHaveBeenCalledWith({
      data: [{ bookId: 3, tagId: "mystery", strength: 1 }],
    });
  });

  it("reports zero books without writing when the database has no books", async () => {
    prismaMock.book.findMany.mockResolvedValue([]);

    await expect(recalculateBookTags()).resolves.toEqual({
      updatedCount: 0,
      totalBooks: 0,
    });
    expect(prismaMock.userBookTag.groupBy).not.toHaveBeenCalled();
    expect(prismaMock.bookTag.createMany).not.toHaveBeenCalled();
  });
});
