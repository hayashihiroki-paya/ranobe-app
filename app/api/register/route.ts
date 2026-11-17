import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registrationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(6)
    .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
});

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

const invalidInputResponse = () =>
  NextResponse.json(
    { error: "入力内容を確認してください" },
    { status: 400 }
  );

const duplicateEmailResponse = () =>
  NextResponse.json(
    { error: "既に登録されています" },
    { status: 400 }
  );

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return invalidInputResponse();
  }

  const result = registrationSchema.safeParse(body);
  if (!result.success) {
    return invalidInputResponse();
  }

  const { name, email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return duplicateEmailResponse();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return duplicateEmailResponse();
    }

    return NextResponse.json(
      { error: "登録に失敗しました" },
      { status: 500 }
    );
  }
}
