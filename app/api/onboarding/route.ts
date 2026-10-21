// app/api/onboarding/route.ts

import { NextResponse } from "next/server"
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth"
import { prisma } from "@/lib/prisma"
import { onboardingSchema } from "@/types/userBookTag"

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return unauthorizedResponse()

  try {
    const parsedBody = onboardingSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "タグが選択されていません" },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.userTagScore.createMany({
        data: parsedBody.data.tagIds.map((tagId) => ({
          userId,
          tagId,
          score: 5,
        })),
        skipDuplicates: true,
      })

      await tx.user.update({
        where: { id: userId },
        data: { onboardingDone: true },
      })
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("ONBOARDING API ERROR", error)
    return NextResponse.json(
      { error: "オンボーディングの保存に失敗しました" },
      { status: 500 }
    )
  }
}