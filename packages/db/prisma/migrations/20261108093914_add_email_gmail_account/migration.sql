/*
  Warnings:

  - Added the required column `gmailAccountId` to the `email` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email" ADD COLUMN     "gmailAccountId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "email" ADD CONSTRAINT "email_gmailAccountId_fkey" FOREIGN KEY ("gmailAccountId") REFERENCES "gmail_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
