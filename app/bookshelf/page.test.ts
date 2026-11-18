import { describe, expect, it, vi } from "vitest"

const { permanentRedirectMock } = vi.hoisted(() => ({
  permanentRedirectMock: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  permanentRedirect: permanentRedirectMock,
}))

import BookshelfPage from "./page"

describe("BookshelfPage", () => {
  it("permanently redirects the legacy URL to the library", () => {
    BookshelfPage()

    expect(permanentRedirectMock).toHaveBeenCalledWith("/library")
  })
})
