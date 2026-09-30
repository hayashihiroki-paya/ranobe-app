import { afterEach, describe, expect, it, vi } from "vitest"
import type { BookDisplay } from "@/types/book"
import { fetchSearchPage } from "./search"

describe("fetchSearchPage", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("requests a page using an encoded keyword and returns the book list", async () => {
    const books: BookDisplay[] = [
      { isbn: "9780000000001", title: "The Example", author: "A. Writer" },
    ]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(books),
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(fetchSearchPage("魔法 と冒険", 3)).resolves.toEqual(books)
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/search?title=${encodeURIComponent("魔法 と冒険")}&page=3`
    )
  })

  it("rejects unsuccessful responses and non-array response data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Unavailable" }),
      })
    )
    await expect(fetchSearchPage("keyword", 2)).rejects.toThrow(
      "検索結果の取得に失敗しました"
    )

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ error: "Invalid response" }),
      })
    )
    await expect(fetchSearchPage("keyword", 2)).rejects.toThrow(
      "検索結果の取得に失敗しました"
    )
  })
})
