import { describe, expect, it } from "vitest";
import type { Book } from "@prisma/client";
import { mapBookToRakutenBook, mapBooksToRakutenBooks } from "./bookMapper";

function book(overrides: Partial<Book> = {}): Book {
  return {
    id: 1,
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
    comment: "Saved comment",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-02T00:00:00.000Z"),
    ...overrides,
  };
}

describe("bookMapper", () => {
  it("maps the public Rakuten fields from a database book", () => {
    expect(mapBookToRakutenBook(book())).toEqual({
      isbn: "9780000000001",
      title: "The Example",
      author: "A. Writer",
      largeImageUrl: "https://images.example/book.jpg",
      itemCaption: "Description",
    });
  });

  it("converts nullable optional fields to undefined", () => {
    expect(
      mapBookToRakutenBook(
        book({ largeImageUrl: null, itemCaption: null }),
      ),
    ).toEqual({
      isbn: "9780000000001",
      title: "The Example",
      author: "A. Writer",
      largeImageUrl: undefined,
      itemCaption: undefined,
    });
  });

  it("maps arrays in order and returns an empty array for no books", () => {
    expect(
      mapBooksToRakutenBooks([
        book({ id: 3, isbn: "third", title: "Third" }),
        book({ id: 2, isbn: "second", title: "Second" }),
      ]),
    ).toEqual([
      {
        isbn: "third",
        title: "Third",
        author: "A. Writer",
        largeImageUrl: "https://images.example/book.jpg",
        itemCaption: "Description",
      },
      {
        isbn: "second",
        title: "Second",
        author: "A. Writer",
        largeImageUrl: "https://images.example/book.jpg",
        itemCaption: "Description",
      },
    ]);
    expect(mapBooksToRakutenBooks([])).toEqual([]);
  });
});
