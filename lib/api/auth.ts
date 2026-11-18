import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  return user?.id ?? null
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { message: "ログインが必要です" },
    { status: 401 }
  )
}
