import { describe, expect, it } from "vitest";
import {
  countDistinctUserTags,
  formatUserTagStats,
  rankUserTags,
} from "./profileSupport";

describe("rankUserTags", () => {
  it("combines usage and scores, sorts descending, and keeps the top five", () => {
    expect(
      rankUserTags(
        [
          { tagId: "fantasy", _count: { tagId: 2 } },
          { tagId: "mystery", _count: { tagId: 3 } },
          { tagId: "romance", _count: { tagId: 1 } },
          { tagId: "comedy", _count: { tagId: 1 } },
          { tagId: "scifi", _count: { tagId: 1 } },
        ],
        [
          { tagId: "fantasy", score: 1 },
          { tagId: "mystery", score: 0.5 },
          { tagId: "romance", score: 4 },
          { tagId: "thriller", score: 2 },
        ],
      ),
    ).toEqual([
      ["romance", 5],
      ["mystery", 3.5],
      ["fantasy", 3],
      ["thriller", 2],
      ["comedy", 1],
    ]);
  });

  it("returns an empty list when there are no tag records", () => {
    expect(rankUserTags([], [])).toEqual([]);
  });
});

describe("formatUserTagStats", () => {
  it("maps known names and labels missing tag rows as unknown", () => {
    expect(
      formatUserTagStats(
        [
          ["fantasy", 4],
          ["missing", 2],
        ],
        [{ id: "fantasy", name: "Fantasy" }],
      ),
    ).toEqual([
      { name: "Fantasy", count: 4 },
      { name: "不明", count: 2 },
    ]);
  });
});

describe("countDistinctUserTags", () => {
  it("counts the union of usage and score tags without duplicates", () => {
    expect(
      countDistinctUserTags(
        [{ tagId: "fantasy" }, { tagId: "mystery" }, { tagId: "fantasy" }],
        [{ tagId: "mystery" }, { tagId: "romance" }],
      ),
    ).toBe(3);
  });

  it("returns zero for empty inputs", () => {
    expect(countDistinctUserTags([], [])).toBe(0);
  });
});
