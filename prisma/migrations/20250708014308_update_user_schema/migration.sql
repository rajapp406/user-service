/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `firstName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - A unique constraint covering the columns `[emailVerificationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "createdBy" UUID,
ADD COLUMN     "deletedAt" TIMESTAMPTZ(3),
ADD COLUMN     "emailVerificationToken" VARCHAR(255),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" VARCHAR(255),
ADD COLUMN     "updatedBy" UUID,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastLoginAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "lastActivityAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "accountLockedUntil" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "users"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_lastActivityAt_idx" ON "users"("lastActivityAt");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
