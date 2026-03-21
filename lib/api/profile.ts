import { prisma } from "@/lib/prisma";

export async function getUserTagStats(userId: string) {
  const result = await prisma.userBookTag.groupBy({
    by: ["tagId"],
    where: {
      userId,
    },
    _count: {
      tagId: true,
    },
    orderBy: {
      _count: {
        tagId: "desc",
      },
    },
    take: 5,
  });

  // tag情報JOIN
  const tags = await prisma.tag.findMany({
    where: {
      id: {
        in: result.map((r) => r.tagId),
      },
    },
  });

  return result.map((r) => {
    const tag = tags.find((t) => t.id === r.tagId);
    return {
      name: tag?.name ?? "不明",
      count: r._count.tagId,
    };
  });
}