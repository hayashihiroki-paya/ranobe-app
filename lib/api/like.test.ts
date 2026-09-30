import { afterEach, describe, expect, it, vi } from "vitest";
import type { RakutenBook } from "@/types/book";
import { likeBook, unlikeBook } from "./like";

const book: RakutenBook = {
  isbn: "9780000000001",
  title: "The Example",
  author: "A. Writer",
};

describe("like API client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts the book as JSON and returns the success response body", async () => {
    const payload = { success: true, id: 12 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(likeBook(book)).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
  });

  it("uses an API error message and falls back when the error body is absent", async () => {
    const customFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "Duplicate ISBN" }),
    });
    vi.stubGlobal("fetch", customFetch);
    await expect(likeBook(book)).rejects.toThrow("Duplicate ISBN");

    const fallbackFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({}),
    });
    vi.stubGlobal("fetch", fallbackFetch);
    await expect(likeBook(book)).rejects.toThrow("Like登録に失敗しました");
  });

  it("uses fallback errors when the error body cannot be parsed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockRejectedValue(new SyntaxError("invalid JSON")),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(likeBook(book)).rejects.toThrow("Like登録に失敗しました");
  });

  it("deletes by ISBN and does not read a response body on success", async () => {
    const json = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
    vi.stubGlobal("fetch", fetchMock);

    await expect(unlikeBook("9780000000001")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/like?isbn=9780000000001",
      { method: "DELETE" },
    );
    expect(json).not.toHaveBeenCalled();
  });

  it("reports custom or fallback errors when unlike fails", async () => {
    const customFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "Not found" }),
    });
    vi.stubGlobal("fetch", customFetch);
    await expect(unlikeBook("unknown")).rejects.toThrow("Not found");

    const emptyMessageFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({}),
    });
    vi.stubGlobal("fetch", emptyMessageFetch);
    await expect(unlikeBook("unknown")).rejects.toThrow(
      "Like解除に失敗しました",
    );

    const fallbackFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockRejectedValue(new SyntaxError("invalid JSON")),
    });
    vi.stubGlobal("fetch", fallbackFetch);
    await expect(unlikeBook("unknown")).rejects.toThrow(
      "Like解除に失敗しました",
    );
  });
});
