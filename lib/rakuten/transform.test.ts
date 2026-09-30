import { describe, expect, it } from "vitest";
import { transformRakutenBooks } from "./transform";

describe("transformRakutenBooks", () => {
  it("maps all Rakuten book fields and adds an empty comment", () => {
    const result = transformRakutenBooks({
      Items: [
        {
          Item: {
            isbn: "9780000000001",
            title: "The Example",
            titleKana: "ジ・イグザンプル",
            author: "A. Writer",
            authorKana: "ライター",
            publisherName: "Example Press",
            salesDate: "2025年1月",
            seriesName: "Examples",
            itemCaption: "A short description",
            largeImageUrl: "https://images.example/book.jpg",
          },
        },
      ],
    });

    expect(result).toEqual([
      {
        isbn: "9780000000001",
        title: "The Example",
        titleKana: "ジ・イグザンプル",
        author: "A. Writer",
        authorKana: "ライター",
        publisherName: "Example Press",
        salesDate: "2025年1月",
        seriesName: "Examples",
        itemCaption: "A short description",
        largeImageUrl: "https://images.example/book.jpg",
        comment: "",
      },
    ]);
  });

  it("preserves absent optional fields and handles an empty item list", () => {
    expect(
      transformRakutenBooks({
        Items: [
          {
            Item: {
              isbn: "9780000000002",
              title: "Minimal",
              author: "Writer",
            },
          },
        ],
      }),
    ).toEqual([
      {
        isbn: "9780000000002",
        title: "Minimal",
        titleKana: undefined,
        author: "Writer",
        authorKana: undefined,
        publisherName: undefined,
        salesDate: undefined,
        seriesName: undefined,
        itemCaption: undefined,
        largeImageUrl: undefined,
        comment: "",
      },
    ]);
    expect(transformRakutenBooks({ Items: [] })).toEqual([]);
  });
});
