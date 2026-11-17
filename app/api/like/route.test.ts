import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  getAuthenticatedUserIdMock,
  unauthorizedResponseMock,
  createUserLikeMock,
  deleteUserLikeByIsbnMock,
  getUserLikeIsbnsMock,
} = vi.hoisted(() => ({
  getAuthenticatedUserIdMock: vi.fn(),
  unauthorizedResponseMock: vi.fn(
    () =>
      new Response(JSON.stringify({ message: "ログインが必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  ),
  createUserLikeMock: vi.fn(),
  deleteUserLikeByIsbnMock: vi.fn(),
  getUserLikeIsbnsMock: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
  unauthorizedResponse: unauthorizedResponseMock,
}));
vi.mock("@/lib/api/likeServer", () => ({
  createUserLike: createUserLikeMock,
  deleteUserLikeByIsbn: deleteUserLikeByIsbnMock,
  getUserLikeIsbns: getUserLikeIsbnsMock,
}));

import { DELETE, GET, POST } from "./route";

const validBook = {
  isbn: "9780000000001",
  title: "The Example",
  author: "A. Writer",
};

function postRequest(body: unknown) {
  return new Request("http://localhost/api/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/like", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1");
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects unauthenticated requests", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    const response = await POST(postRequest(validBook));

    expect(response.status).toBe(401);
    expect(createUserLikeMock).not.toHaveBeenCalled();
  });

  it("validates required book fields before creating a like", async () => {
    const response = await POST(postRequest({ isbn: validBook.isbn }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "isbn / title / author 必須",
    });
    expect(createUserLikeMock).not.toHaveBeenCalled();
  });

  it("creates a like for the authenticated user", async () => {
    createUserLikeMock.mockResolvedValue({ id: 17 });

    const response = await POST(postRequest(validBook));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      likeId: 17,
    });
    expect(createUserLikeMock).toHaveBeenCalledWith("reader-1", validBook);
  });

  it("returns liked ISBNs for the authenticated user", async () => {
    getUserLikeIsbnsMock.mockResolvedValue([
      "9780000000001",
      "9780000000002",
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      "9780000000001",
      "9780000000002",
    ]);
    expect(getUserLikeIsbnsMock).toHaveBeenCalledWith("reader-1");
  });

  it("requires an ISBN when deleting a like", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/like", { method: "DELETE" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "isbn 必須" });
    expect(deleteUserLikeByIsbnMock).not.toHaveBeenCalled();
  });

  it("deletes a like by ISBN for the authenticated user", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/like?isbn=9780000000001", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(deleteUserLikeByIsbnMock).toHaveBeenCalledWith(
      "reader-1",
      "9780000000001",
    );
  });

  it("returns a server error when creating a like fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    createUserLikeMock.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(postRequest(validBook));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "お気に入り登録に失敗しました",
    });
  });
});
