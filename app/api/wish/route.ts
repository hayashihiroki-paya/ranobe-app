import { NextResponse } from "next/server"
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth"
import {
  createUserWish,
  deleteUserWishByIsbn,
  getUserWishBooks,
} from "@/lib/api/wishServer"
import { bookInputSchema } from "@/types/book"

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

    const wish = await createUserWish(userId, parsedBody.data)
    return NextResponse.json({ success: true, wishId: wish.id })
  } catch (error) {
    console.error("WISH API ERROR", error)
    return NextResponse.json(
      { message: "Wish登録失敗" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return unauthorizedResponse()

  try {
    const isbn = new URL(req.url).searchParams.get("isbn")
    if (!isbn) {
      return NextResponse.json(
        { message: "isbn 必須" },
        { status: 400 }
      )
    }

    await deleteUserWishByIsbn(userId, isbn)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("WISH DELETE ERROR", error)
    return NextResponse.json(
      { message: "Wish解除失敗" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const userId = await getAuthenticatedUserId()
  if (!userId) return unauthorizedResponse()

  try {
    const books = await getUserWishBooks(userId)
    return NextResponse.json(books)
  } catch (error) {
    console.error("WISH GET ERROR", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
