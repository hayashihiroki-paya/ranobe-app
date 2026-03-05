import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function DELETE(
  req: Request,
  { params }: { params: { bookId: string } }
) {

  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const bookId = Number(params.bookId)

  await prisma.like.delete({
    where: {
      userId_bookId: {
        userId: session.user.id,
        bookId
      }
    }
  })

  return Response.json({ success: true })
}