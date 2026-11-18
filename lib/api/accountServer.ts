import { prisma } from "@/lib/prisma"

export async function deleteUserAccount(userId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.userBookTag.deleteMany({ where: { userId } })
    await tx.userTagScore.deleteMany({ where: { userId } })
    await tx.likeRank.deleteMany({ where: { userId } })
    await tx.like.deleteMany({ where: { userId } })
    await tx.wish.deleteMany({ where: { userId } })
    await tx.account.deleteMany({ where: { userId } })
    await tx.session.deleteMany({ where: { userId } })
    await tx.user.delete({ where: { id: userId } })
  })
}
