import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUserIdMock, unauthorizedResponseMock, getRecommendBooksMock } =
  vi.hoisted(() => ({
    getAuthenticatedUserIdMock: vi.fn(),
    unauthorizedResponseMock: vi.fn(
      () =>
        new Response(JSON.stringify({ message: "ログインが必要です" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
    ),
    getRecommendBooksMock: vi.fn(),
  }));

vi.mock("@/lib/api/auth", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
  unauthorizedResponse: unauthorizedResponseMock,
}));
vi.mock("@/lib/api/recommend/getRecommendBooks", () => ({
  getRecommendBooks: getRecommendBooksMock,
}));

import { GET } from "./route";

describe("GET /api/recommend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1");
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects unauthenticated requests", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(getRecommendBooksMock).not.toHaveBeenCalled();
  });

  it("returns recommendations for the authenticated user", async () => {
    const recommendations = [{ isbn: "9780000000001", score: 0.91 }];
    getRecommendBooksMock.mockResolvedValue(recommendations);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(recommendations);
    expect(getRecommendBooksMock).toHaveBeenCalledWith("reader-1");
  });

  it("returns a server error when recommendation lookup fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getRecommendBooksMock.mockRejectedValue(new Error("database unavailable"));

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
  });
});
