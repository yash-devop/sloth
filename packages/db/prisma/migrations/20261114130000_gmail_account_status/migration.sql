-- CreateEnum
CREATE TYPE "GmailAccountStatus" AS ENUM ('CONNECTED', 'DISCONNECTED');

-- AlterTable
ALTER TABLE "gmail_account" ADD COLUMN     "disconnectedAt" TIMESTAMP(3),
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "status" "GmailAccountStatus" NOT NULL DEFAULT 'CONNECTED';
