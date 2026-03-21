// app/api/onboarding/route.ts

import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()
  console.log("body", body)
  const tagIds: string[] = body.tagIds ?? []

  // 🔥 バリデーション（超重要）
  if (tagIds.length === 0) {
    return Response.json(
      { error: "タグが選択されていません" },
      { status: 400 }
    )
  }

  await prisma.userTagScore.createMany({
    data: tagIds.map((tagId) => ({
      userId: session.user.id,
      tagId,
      score: 5,
    })),
    skipDuplicates: true,
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingDone: true,
    },
  })

  return Response.json({ ok: true })
}