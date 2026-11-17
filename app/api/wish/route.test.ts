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
  createUserWishMock,
  deleteUserWishByIsbnMock,
  getUserWishBooksMock,
} = vi.hoisted(() => ({
  getAuthenticatedUserIdMock: vi.fn(),
  unauthorizedResponseMock: vi.fn(
    () =>
      new Response(JSON.stringify({ message: "ログインが必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  ),
  createUserWishMock: vi.fn(),
  deleteUserWishByIsbnMock: vi.fn(),
  getUserWishBooksMock: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
  unauthorizedResponse: unauthorizedResponseMock,
}));
vi.mock("@/lib/api/wishServer", () => ({
  createUserWish: createUserWishMock,
  deleteUserWishByIsbn: deleteUserWishByIsbnMock,
  getUserWishBooks: getUserWishBooksMock,
}));

import { DELETE, GET, POST } from "./route";

const validBook = {
  isbn: "9780000000001",
  title: "The Example",
  author: "A. Writer",
};

function postRequest(body: unknown) {
  return new Request("http://localhost/api/wish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/wish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1");
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects unauthenticated requests", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    const response = await POST(postRequest(validBook));

    expect(response.status).toBe(401);
    expect(createUserWishMock).not.toHaveBeenCalled();
  });

  it("validates required book fields before creating a wish", async () => {
    const response = await POST(postRequest({ isbn: validBook.isbn }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "isbn / title / author 必須",
    });
    expect(createUserWishMock).not.toHaveBeenCalled();
  });

  it("creates a wish for the authenticated user", async () => {
    createUserWishMock.mockResolvedValue({ id: 23 });

    const response = await POST(postRequest(validBook));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      wishId: 23,
    });
    expect(createUserWishMock).toHaveBeenCalledWith("reader-1", validBook);
  });

  it("returns wish books for the authenticated user", async () => {
    const books = [{ isbn: "9780000000001", title: "The Example" }];
    getUserWishBooksMock.mockResolvedValue(books);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(books);
    expect(getUserWishBooksMock).toHaveBeenCalledWith("reader-1");
  });

  it("requires an ISBN when deleting a wish", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/wish", { method: "DELETE" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "isbn 必須" });
    expect(deleteUserWishByIsbnMock).not.toHaveBeenCalled();
  });

  it("deletes a wish by ISBN for the authenticated user", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/wish?isbn=9780000000001", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(deleteUserWishByIsbnMock).toHaveBeenCalledWith(
      "reader-1",
      "9780000000001",
    );
  });

  it("returns a server error when wish creation fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    createUserWishMock.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(postRequest(validBook));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "Wish登録失敗",
    });
  });
});
