/*
  Warnings:

  - You are about to drop the column `emailVerificationToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_emailVerificationToken_key";

-- DropIndex
DROP INDEX "users_passwordResetToken_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerificationToken",
DROP COLUMN "passwordResetExpires",
DROP COLUMN "passwordResetToken",
ALTER COLUMN "passwordChangedAt" SET DATA TYPE TIMESTAMPTZ(3);
