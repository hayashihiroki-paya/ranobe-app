import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    tag: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { GET } from "./route";

describe("GET /api/tags", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("returns tags ordered by category and name", async () => {
    const tags = [
      { id: "tag-1", name: "Fantasy", category: "genre" },
      { id: "tag-2", name: "Adventure", category: "element" },
    ];
    prismaMock.tag.findMany.mockResolvedValue(tags);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(tags);
    expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  });

  it("returns a server error when tag lookup fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.tag.findMany.mockRejectedValue(new Error("database unavailable"));

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "タグ取得に失敗しました",
    });
  });
});
