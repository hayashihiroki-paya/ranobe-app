import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { message: "ログインが必要です" },
    { status: 401 }
  )
}
