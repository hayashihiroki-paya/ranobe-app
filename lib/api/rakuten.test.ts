import { afterEach, describe, expect, it, vi } from "vitest";
import { searchBooks } from "./rakuten";

describe("searchBooks", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("requests the search endpoint and returns parsed JSON", async () => {
    const payload = { Items: [{ Item: { isbn: "9780000000001" } }] };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchBooks("Dune")).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith("/api/rakuten/search?title=Dune");
  });

  it("throws the search failure message for a non-success response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchBooks("Dune")).rejects.toThrow("検索失敗");
  });
});
