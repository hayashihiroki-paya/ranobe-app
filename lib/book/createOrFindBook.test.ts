import { describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";
import type { BookInput } from "@/types/book";
import { createOrFindBook } from "./createOrFindBook";

const input: BookInput = {
  isbn: "9780000000001",
  title: "The Example",
  titleKana: "ジ・イグザンプル",
  author: "A. Writer",
  authorKana: "ライター",
  publisherName: "Example Press",
  salesDate: "2025年1月",
  seriesName: "Examples",
  itemCaption: "Description",
  largeImageUrl: "https://images.example/book.jpg",
  comment: "Reader note",
};

function transactionClient(
  book: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> },
): Prisma.TransactionClient {
  return { book } as unknown as Prisma.TransactionClient;
}

describe("createOrFindBook", () => {
  it("returns an existing ISBN match without creating another row", async () => {
    const existing = { id: 5, isbn: input.isbn, title: "Saved title" };
    const book = {
      findUnique: vi.fn().mockResolvedValue(existing),
      create: vi.fn(),
    };

    await expect(
      createOrFindBook(transactionClient(book), input),
    ).resolves.toEqual(existing);
    expect(book.findUnique).toHaveBeenCalledWith({
      where: { isbn: input.isbn },
    });
    expect(book.create).not.toHaveBeenCalled();
  });

  it("creates a missing ISBN with all supplied book fields", async () => {
    const created = { id: 6, ...input };
    const book = {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(created),
    };

    await expect(
      createOrFindBook(transactionClient(book), input),
    ).resolves.toEqual(created);
    expect(book.create).toHaveBeenCalledWith({ data: input });
  });
});
