-- CreateTable
CREATE TABLE "LikeRank" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "LikeRank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LikeRank_userId_bookId_key" ON "LikeRank"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "LikeRank_userId_rank_key" ON "LikeRank"("userId", "rank");

-- AddForeignKey
ALTER TABLE "LikeRank" ADD CONSTRAINT "LikeRank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeRank" ADD CONSTRAINT "LikeRank_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
