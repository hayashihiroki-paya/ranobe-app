import { NextResponse } from "next/server"
import { bookInputSchema } from "@/types/book"
import {
  getAuthenticatedUserId,
  unauthorizedResponse,
} from "@/lib/api/auth"
import {
  createUserLike,
  deleteUserLikeByIsbn,
  getUserLikeIsbns,
} from "@/lib/api/likeServer"

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return unauthorizedResponse()

  try {
    const parsedBody = bookInputSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return NextResponse.json(
        { message: "isbn / title / author 必須" },
        { status: 400 }
      )
    }

    const like = await createUserLike(userId, parsedBody.data)

    return NextResponse.json({
      success: true,
      likeId: like.id,
    })
  } catch (error: unknown) {
    console.error("LIKE API ERROR", error)

    return NextResponse.json(
      { message: "お気に入り登録に失敗しました" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(req.url)
    const isbn = searchParams.get("isbn")

    if (!isbn) {
      return NextResponse.json(
        { message: "isbn 必須" },
        { status: 400 }
      )
    }

    await deleteUserLikeByIsbn(userId, isbn)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("UNLIKE API ERROR", error)

    return NextResponse.json(
      { message: "お気に入り解除失敗" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return unauthorizedResponse()

    const isbns = await getUserLikeIsbns(userId)
    return NextResponse.json(isbns)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
