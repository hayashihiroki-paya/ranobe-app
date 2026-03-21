import { prisma } from "@/lib/prisma";

export default async function CommonTags({
  myUserId,
  targetUserId,
}: {
  myUserId: string;
  targetUserId: string;
}) {
  const myTags = await prisma.userBookTag.findMany({
    where: { userId: myUserId },
    select: { tagId: true },
  });

  const targetTags = await prisma.userBookTag.findMany({
    where: { userId: targetUserId },
    select: { tagId: true },
  });

  const mySet = new Set(myTags.map((t) => t.tagId));
  const commonIds = targetTags
    .map((t) => t.tagId)
    .filter((id) => mySet.has(id));

  if (commonIds.length === 0) return null;

  const tags = await prisma.tag.findMany({
    where: {
      id: { in: commonIds },
    },
  });

  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold mb-2">🤝 共通タグ</h2>

      <div className="text-sm">
        {tags.map((t) => t.name).join(" / ")}
      </div>
    </div>
  );
}