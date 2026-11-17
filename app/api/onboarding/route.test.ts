import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  prismaMock,
  transactionClientMock,
  getAuthenticatedUserIdMock,
  unauthorizedResponseMock,
} = vi.hoisted(() => ({
  prismaMock: { $transaction: vi.fn() },
  transactionClientMock: {
    userTagScore: { createMany: vi.fn() },
    user: { update: vi.fn() },
  },
  getAuthenticatedUserIdMock: vi.fn(),
  unauthorizedResponseMock: vi.fn(
    () =>
      new Response(JSON.stringify({ message: "ログインが必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  ),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/api/auth", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
  unauthorizedResponse: unauthorizedResponseMock,
}));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserIdMock.mockResolvedValue("reader-1");
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof transactionClientMock) => Promise<unknown>) =>
        callback(transactionClientMock),
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects unauthenticated requests without starting a transaction", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    const response = await POST(request({ tagIds: ["fantasy"] }));

    expect(response.status).toBe(401);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("requires at least one tag before saving onboarding data", async () => {
    const response = await POST(request({ tagIds: [] }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "タグが選択されていません",
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("saves tag scores and marks onboarding complete in one transaction", async () => {
    const response = await POST(request({ tagIds: ["fantasy", "mystery"] }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    expect(transactionClientMock.userTagScore.createMany).toHaveBeenCalledWith({
      data: [
        { userId: "reader-1", tagId: "fantasy", score: 5 },
        { userId: "reader-1", tagId: "mystery", score: 5 },
      ],
      skipDuplicates: true,
    });
    expect(transactionClientMock.user.update).toHaveBeenCalledWith({
      where: { id: "reader-1" },
      data: { onboardingDone: true },
    });
  });

  it("returns a server error when the transaction fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.$transaction.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(request({ tagIds: ["fantasy"] }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "オンボーディングの保存に失敗しました",
    });
  });
});
