import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { getAuthenticatedUserIdMock, deleteUserAccountMock } = vi.hoisted(() => ({
  getAuthenticatedUserIdMock: vi.fn(),
  deleteUserAccountMock: vi.fn(),
}))

vi.mock("@/lib/api/auth", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
  unauthorizedResponse: () =>
    new Response(JSON.stringify({ message: "ログインが必要です" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }),
}))
vi.mock("@/lib/api/accountServer", () => ({
  deleteUserAccount: deleteUserAccountMock,
}))

import { POST } from "./route"

function request(body: string) {
  return new Request("http://localhost/api/account/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
}

describe("POST /api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1")
    deleteUserAccountMock.mockResolvedValue(undefined)
  })
  afterEach(() => vi.restoreAllMocks())

  it("requires authentication before reading the request body", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null)

    const response = await POST(request("invalid json"))

    expect(response.status).toBe(401)
    expect(deleteUserAccountMock).not.toHaveBeenCalled()
  })

  it("requires the exact confirmation text", async () => {
    const response = await POST(request(JSON.stringify({ confirmation: "削除" })))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      message: "削除の確認内容が一致しません",
    })
    expect(deleteUserAccountMock).not.toHaveBeenCalled()
  })

  it("deletes only the authenticated user's data", async () => {
    const response = await POST(
      request(
        JSON.stringify({
          confirmation: "削除する",
          userId: "another-user",
        }),
      ),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
    expect(deleteUserAccountMock).toHaveBeenCalledWith("reader-1")
  })

  it("returns a safe error when the deletion transaction fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    deleteUserAccountMock.mockRejectedValue(new Error("database unavailable"))

    const response = await POST(request(JSON.stringify({ confirmation: "削除する" })))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      message: "アカウント削除に失敗しました。時間をおいて、もう一度お試しください。",
    })
  })
})
