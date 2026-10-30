-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing rows with their current creation time, then match the
-- Prisma schema (no database default; @updatedAt is handled by Prisma).
ALTER TABLE "Blog" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Blog_time_idx" ON "Blog"("time");

-- CreateIndex
CREATE INDEX "Blog_authorId_idx" ON "Blog"("authorId");
