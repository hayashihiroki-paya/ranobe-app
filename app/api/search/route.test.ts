import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const rakutenItem = {
  isbn: "9780000000001",
  title: "The Example",
  titleKana: "ジ・イグザンプル",
  author: "A. Writer",
  authorKana: "ライター",
  publisherName: "Example Press",
  salesDate: "2026年01月01日",
  seriesName: "Example Series",
  itemCaption: "An example book.",
  largeImageUrl: "https://example.com/book.jpg",
};

describe("GET /api/search", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv("RAKUTEN_APP_ID", "test-application-id");
    // Keep the test compatible with the new server-side auth configuration.
    vi.stubEnv("RAKUTEN_ACCESS_KEY", "test-access-key");
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rejects requests without a title or ISBN without calling Rakuten", async () => {
    const response = await GET(new Request("http://localhost/api/search"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "title or isbn required",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("searches by title and maps Rakuten items to the app response", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        Items: [{ Item: rakutenItem }],
      }),
    });

    const response = await GET(
      new Request(
        "http://localhost/api/search?title=Example%20Novel&page=3&booksGenreId=001004008",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      { ...rakutenItem, comment: "" },
    ]);

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe(
      "/services/api/BooksBook/Search/20170404",
    );
    expect(requestedUrl.searchParams.get("applicationId")).toBe(
      "test-application-id",
    );
    expect(requestedUrl.searchParams.get("title")).toBe("Example Novel");
    expect(requestedUrl.searchParams.get("page")).toBe("3");
    expect(requestedUrl.searchParams.get("booksGenreId")).toBe("001004008");
    expect(requestedUrl.searchParams.get("hits")).toBe("20");
  });

  it("searches by ISBN and returns an empty list when no books match", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ Items: [] }),
    });

    const response = await GET(
      new Request("http://localhost/api/search?isbn=9780000000001"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.searchParams.get("isbn")).toBe("9780000000001");
    expect(requestedUrl.searchParams.has("title")).toBe(false);
  });

  it("returns a stable API error when the upstream request fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error("network unavailable"));

    const response = await GET(
      new Request("http://localhost/api/search?title=Example"),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Rakuten API error",
    });
  });
});
