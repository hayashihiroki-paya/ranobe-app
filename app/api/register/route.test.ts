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

describe("POST /api/register", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("rejects an email that already has an account", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "existing-user" });

    const response = await POST(
      request({
        email: "reader@example.com",
        password: "secret",
        name: "Reader",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "既に登録されています",
    });
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("hashes the password before creating a new user", async () => {
    const createdUser = {
      id: "reader-1",
      email: "reader@example.com",
      name: "Reader",
    };
    prismaMock.user.findUnique.mockResolvedValue(null);
    bcryptHashMock.mockResolvedValue("hashed-password");
    prismaMock.user.create.mockResolvedValue(createdUser);

    const response = await POST(
      request({
        email: "reader@example.com",
        password: "plain-password",
        name: "Reader",
      }),
    );

    expect(response.status).toBe(200);
    expect(bcryptHashMock).toHaveBeenCalledWith("plain-password", 10);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "reader@example.com",
        password: "hashed-password",
        name: "Reader",
      },
    });
    await expect(response.json()).resolves.toMatchObject(createdUser);
  });
});
