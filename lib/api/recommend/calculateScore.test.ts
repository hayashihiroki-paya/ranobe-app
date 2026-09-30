import { describe, expect, it } from "vitest";
import { calculateScore } from "./calculateScore";

describe("calculateScore", () => {
  it("combines cosine similarity with match-count, match-rate, and size bonuses", () => {
    const result = calculateScore(
      [
        { tagId: "fantasy", score: 3 },
        { tagId: "adventure", score: 4 },
      ],
      [
        { tagId: "fantasy", count: 2 },
        { tagId: "adventure", count: 1 },
        { tagId: "romance", count: 2 },
      ],
    );

    expect(result?.matchCount).toBe(2);
    expect(result?.score).toBeCloseTo(
      10 / 15 + 2 * 0.03 + (2 / 3) * 0.1 + Math.log(4) * 0.02,
      12,
    );
  });

  it("returns null when either vector has zero magnitude", () => {
    expect(
      calculateScore([{ tagId: "fantasy", score: 0 }], [
        { tagId: "fantasy", count: 2 },
      ]),
    ).toBeNull();
    expect(
      calculateScore([{ tagId: "fantasy", score: 2 }], []),
    ).toBeNull();
    expect(calculateScore([], [{ tagId: "fantasy", count: 2 }])).toBeNull();
  });

  it("returns null when nonzero vectors have no shared tags", () => {
    expect(
      calculateScore([{ tagId: "fantasy", score: 2 }], [
        { tagId: "romance", count: 5 },
      ]),
    ).toBeNull();
  });

  it("returns null when a shared tag contributes a zero dot product", () => {
    expect(
      calculateScore([{ tagId: "fantasy", score: 3 }], [
        { tagId: "fantasy", count: 0 },
      ]),
    ).toBeNull();
  });

  it("uses the first matching book tag when an input contains duplicate tag ids", () => {
    const result = calculateScore(
      [{ tagId: "fantasy", score: 2 }],
      [
        { tagId: "fantasy", count: 1 },
        { tagId: "fantasy", count: 4 },
      ],
    );

    expect(result?.matchCount).toBe(1);
    expect(result?.score).toBeCloseTo(
      2 / (2 * Math.sqrt(17)) + 0.03 + 0.05 + Math.log(3) * 0.02,
      12,
    );
  });
});
