import { NextResponse } from "next/server"
import { ACCOUNT_DELETION_CONFIRMATION } from "@/features/account/constants"
import { deleteUserAccount } from "@/lib/api/accountServer"
import {
  getAuthenticatedUserId,
  unauthorizedResponse,
} from "@/lib/api/auth"

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return unauthorizedResponse()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { message: "削除の確認内容を入力してください" },
      { status: 400 },
    )
  }

  const confirmation =
    typeof body === "object" && body !== null && "confirmation" in body
      ? body.confirmation
      : undefined

  if (confirmation !== ACCOUNT_DELETION_CONFIRMATION) {
    return NextResponse.json(
      { message: "削除の確認内容が一致しません" },
      { status: 400 },
    )
  }

  try {
    await deleteUserAccount(userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("ACCOUNT DELETE ERROR", error)
    return NextResponse.json(
      { message: "アカウント削除に失敗しました。時間をおいて、もう一度お試しください。" },
      { status: 500 },
    )
  }
}
