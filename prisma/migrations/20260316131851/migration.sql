/*
  Warnings:

  - You are about to drop the `UserTagPreference` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TagCategory" ADD VALUE 'WORLD';
ALTER TYPE "TagCategory" ADD VALUE 'SETTING';
ALTER TYPE "TagCategory" ADD VALUE 'CHARACTER';

-- DropForeignKey
ALTER TABLE "UserTagPreference" DROP CONSTRAINT "UserTagPreference_tagId_fkey";

-- DropForeignKey
ALTER TABLE "UserTagPreference" DROP CONSTRAINT "UserTagPreference_userId_fkey";

-- DropTable
DROP TABLE "UserTagPreference";

-- CreateTable
CREATE TABLE "UserTagScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "UserTagScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBookTag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "tagId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "UserBookTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTagScore_userId_tagId_key" ON "UserTagScore"("userId", "tagId");

-- CreateIndex
CREATE INDEX "UserBookTag_userId_idx" ON "UserBookTag"("userId");

-- CreateIndex
CREATE INDEX "UserBookTag_tagId_idx" ON "UserBookTag"("tagId");

-- CreateIndex
CREATE INDEX "UserBookTag_bookId_idx" ON "UserBookTag"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBookTag_userId_bookId_tagId_key" ON "UserBookTag"("userId", "bookId", "tagId");

-- AddForeignKey
ALTER TABLE "UserTagScore" ADD CONSTRAINT "UserTagScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTagScore" ADD CONSTRAINT "UserTagScore_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookTag" ADD CONSTRAINT "UserBookTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookTag" ADD CONSTRAINT "UserBookTag_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookTag" ADD CONSTRAINT "UserBookTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
