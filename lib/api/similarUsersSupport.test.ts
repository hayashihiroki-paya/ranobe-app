import { describe, expect, it } from "vitest";
import {
  calcSimilarity,
  formatSimilarUsers,
  groupUserTags,
  mergeTagMap,
  rankSimilarUsers,
} from "./similarUsersSupport";

describe("groupUserTags", () => {
  it("groups usage and weighted scores by user", () => {
    expect(
      groupUserTags(
        [
          { userId: "reader-1", tagId: "fantasy" },
          { userId: "reader-2", tagId: "mystery" },
          { userId: "reader-1", tagId: "romance" },
        ],
        [
          { userId: "reader-1", tagId: "fantasy", score: 2 },
          { userId: "reader-2", tagId: "mystery", score: 3 },
        ],
      ),
    ).toEqual({
      usage: {
        "reader-1": [{ tagId: "fantasy" }, { tagId: "romance" }],
        "reader-2": [{ tagId: "mystery" }],
      },
      scores: {
        "reader-1": [{ tagId: "fantasy", score: 2 }],
        "reader-2": [{ tagId: "mystery", score: 3 }],
      },
    });
  });
});

describe("mergeTagMap", () => {
  it("adds repeated usage and score weights for the same tag", () => {
    expect(
      mergeTagMap(
        [{ tagId: "fantasy" }, { tagId: "fantasy" }, { tagId: "mystery" }],
        [
          { tagId: "fantasy", score: 2.5 },
          { tagId: "romance", score: 1 },
        ],
      ),
    ).toEqual({ fantasy: 4.5, mystery: 1, romance: 1 });
  });
});

describe("calcSimilarity", () => {
  it("caps identical multi-tag vectors at one", () => {
    expect(
      calcSimilarity({ fantasy: 1, mystery: 1 }, { fantasy: 1, mystery: 1 }),
    ).toEqual({ score: 1, commonCount: 2 });
  });

  it("returns zero when fewer than two tags overlap or either vector is empty", () => {
    expect(
      calcSimilarity({ fantasy: 1, mystery: 1 }, { fantasy: 5, romance: 2 }),
    ).toEqual({ score: 0, commonCount: 1 });
    expect(calcSimilarity({}, { fantasy: 1 })).toEqual({
      score: 0,
      commonCount: 0,
    });
  });
});

describe("rankSimilarUsers", () => {
  it("filters low-overlap candidates and supplies a fallback name", () => {
    const userTags = {
      usage: {
        me: [{ tagId: "a" }, { tagId: "b" }, { tagId: "c" }],
        weak: [{ tagId: "a" }],
        strong: [{ tagId: "a" }, { tagId: "b" }, { tagId: "c" }],
      },
      scores: {
        me: [{ tagId: "a", score: 1 }],
        weak: [],
        strong: [
          { tagId: "a", score: 1 },
          { tagId: "d", score: 4 },
        ],
      },
    };

    expect(
      rankSimilarUsers(
        "me",
        [
          { id: "weak", name: "Weak" },
          { id: "strong", name: null },
        ],
        userTags,
      ),
    ).toEqual([
      {
        id: "strong",
        name: "ユーザー",
        score: expect.any(Number),
        commonCount: 3,
        topTagIds: ["d", "a", "b"],
      },
    ]);
  });
});

describe("formatSimilarUsers", () => {
  it("maps tags, rounds scores, sorts candidates, and returns at most five", () => {
    const candidates = [0.51, 0.88, 0.93, 0.72, 0.65, 0.98].map(
      (score, index) => ({
        id: `reader-${index}`,
        name: `Reader ${index}`,
        score,
        commonCount: 2,
        topTagIds: ["fantasy", `missing-${index}`],
      }),
    );

    const result = formatSimilarUsers(candidates, [
      { id: "fantasy", name: "Fantasy" },
    ]);

    expect(result).toHaveLength(5);
    expect(result.map(({ id }) => id)).toEqual([
      "reader-5",
      "reader-2",
      "reader-1",
      "reader-3",
      "reader-4",
    ]);
    expect(result[0]).toEqual({
      id: "reader-5",
      name: "Reader 5",
      score: 98,
      tags: ["Fantasy", ""],
    });
  });
});
