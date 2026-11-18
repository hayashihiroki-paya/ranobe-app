import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock, findUniqueMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  findUniqueMock: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: findUniqueMock } },
}));

import { getAuthenticatedUserId, unauthorizedResponse } from "./auth";

describe("getAuthenticatedUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUniqueMock.mockResolvedValue({ id: "reader-1" });
  });

  it("returns the authenticated user ID from the session", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "reader-1" } });

    await expect(getAuthenticatedUserId()).resolves.toBe("reader-1");
    expect(getServerSessionMock).toHaveBeenCalledWith({});
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { id: "reader-1" },
      select: { id: true },
    });
  });

  it("rejects a session whose user has been deleted", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "reader-1" } });
    findUniqueMock.mockResolvedValue(null);

    await expect(getAuthenticatedUserId()).resolves.toBeNull();
  });

  it.each([
    ["a missing session", null],
    ["a session without a user", {}],
    ["a session with a null user", { user: null }],
    ["a user without an ID", { user: {} }],
  ])("returns null for %s", async (_description, session) => {
    getServerSessionMock.mockResolvedValue(session);

    await expect(getAuthenticatedUserId()).resolves.toBeNull();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });
});

describe("unauthorizedResponse", () => {
  it("returns a 401 response with the login message", async () => {
    const response = unauthorizedResponse();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "ログインが必要です",
    });
  });
});
