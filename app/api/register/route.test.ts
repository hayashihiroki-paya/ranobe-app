import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, bcryptHashMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  bcryptHashMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({
  default: { hash: bcryptHashMock },
}));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function malformedJsonRequest() {
  return new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
}

describe("POST /api/register", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("rejects malformed JSON without querying the database", async () => {
    const response = await POST(malformedJsonRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "入力内容を確認してください",
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it.each([
    ["an empty name", { name: " ", email: "reader@example.com", password: "secret1" }],
    ["an invalid email", { name: "Reader", email: "invalid", password: "secret1" }],
    ["a short password", { name: "Reader", email: "reader@example.com", password: "short" }],
    ["a password longer than bcrypt's byte limit", {
      name: "Reader",
      email: "reader@example.com",
      password: "あ".repeat(25),
    }],
  ])("rejects %s before querying the database", async (_description, body) => {
    const response = await POST(request(body));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "入力内容を確認してください",
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(bcryptHashMock).not.toHaveBeenCalled();
  });

  it("rejects an email that already has an account", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "existing-user" });

    const response = await POST(
      request({
        name: "Reader",
        email: "reader@example.com",
        password: "secret1",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "既に登録されています",
    });
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("hashes valid credentials and returns only public user fields", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    bcryptHashMock.mockResolvedValue("hashed-password");
    prismaMock.user.create.mockResolvedValue({
      id: "reader-1",
      email: "reader@example.com",
      name: "Reader",
      password: "hashed-password",
      image: "private-image-value",
    });

    const response = await POST(
      request({
        name: " Reader ",
        email: " reader@example.com ",
        password: "plain-password",
      }),
    );

    expect(response.status).toBe(200);
    expect(bcryptHashMock).toHaveBeenCalledWith("plain-password", 10);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: "Reader",
        email: "reader@example.com",
        password: "hashed-password",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    await expect(response.json()).resolves.toEqual({
      id: "reader-1",
      email: "reader@example.com",
      name: "Reader",
    });
  });

  it("returns the duplicate-account response for a uniqueness race", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    bcryptHashMock.mockResolvedValue("hashed-password");
    prismaMock.user.create.mockRejectedValue({ code: "P2002" });

    const response = await POST(
      request({
        name: "Reader",
        email: "reader@example.com",
        password: "plain-password",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "既に登録されています",
    });
  });

  it("returns a generic server error when registration storage fails", async () => {
    prismaMock.user.findUnique.mockRejectedValue(
      new Error("database failure with private details"),
    );

    const response = await POST(
      request({
        name: "Reader",
        email: "reader@example.com",
        password: "plain-password",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "登録に失敗しました",
    });
  });
});
