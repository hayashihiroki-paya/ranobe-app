import { PrismaClient, TagCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const weights = [
    { category: TagCategory.PROTAGONIST, weight: 1.5 },
    { category: TagCategory.STYLE, weight: 1.3 },
    { category: TagCategory.PLOT, weight: 1.2 },
    { category: TagCategory.RELATION, weight: 1.2 },
    { category: TagCategory.ABILITY, weight: 1.1 },
    { category: TagCategory.GENRE, weight: 1.0 },
    { category: TagCategory.NARRATIVE, weight: 1.1 },
    { category: TagCategory.TONE, weight: 0.9 },
  ];

  for (const w of weights) {
    await prisma.categoryWeight.upsert({
      where: { category: w.category },
      update: { weight: w.weight },
      create: w,
    });
  }

  console.log("CategoryWeight seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());