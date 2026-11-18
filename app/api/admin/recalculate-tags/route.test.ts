import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  getServerSessionMock,
  getAuthenticatedUserIdMock,
  recalculateBookTagsMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  getAuthenticatedUserIdMock: vi.fn(),
  recalculateBookTagsMock: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));
vi.mock("@/lib/api/auth", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
}));
vi.mock("@/lib/batch/recalculateBookTags", () => ({
  recalculateBookTags: recalculateBookTagsMock,
}));

import { POST } from "./route";

function request(body: unknown = {}) {
  return new Request("http://localhost/api/admin/recalculate-tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/recalculate-tags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("requires a signed-in user", async () => {
    getServerSessionMock.mockResolvedValue(null);
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(recalculateBookTagsMock).not.toHaveBeenCalled();
  });

  it("forbids users who are not the configured admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "reader@example.com" },
    });

    const response = await POST(request());

    expect(response.status).toBe(403);
    expect(recalculateBookTagsMock).not.toHaveBeenCalled();
  });

  it("runs the recalculation for the configured admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@example.com" },
    });
    recalculateBookTagsMock.mockResolvedValue({ updatedCount: 3 });

    const response = await POST(request({ bookId: 42 }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      updatedCount: 3,
    });
    expect(recalculateBookTagsMock).toHaveBeenCalledWith(42);
  });

  it("returns a server error when recalculation fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@example.com" },
    });
    recalculateBookTagsMock.mockRejectedValue(
      new Error("database unavailable"),
    );

    const response = await POST(request());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
  });
});
