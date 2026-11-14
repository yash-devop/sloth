-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- DropIndex
DROP INDEX "email_userId_gmailMessageId_key";

-- AlterTable
ALTER TABLE "email" ADD COLUMN     "html" TEXT,
ADD COLUMN     "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "recipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "snippet" TEXT,
ADD COLUMN     "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "threadId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "gmailMessageId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "email_gmailAccountId_receivedAt_idx" ON "email"("gmailAccountId", "receivedAt");

-- CreateIndex
CREATE INDEX "email_gmailAccountId_threadId_idx" ON "email"("gmailAccountId", "threadId");

-- CreateIndex
CREATE UNIQUE INDEX "email_gmailAccountId_gmailMessageId_key" ON "email"("gmailAccountId", "gmailMessageId");
