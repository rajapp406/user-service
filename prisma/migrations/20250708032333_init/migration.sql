/*
  Warnings:

  - You are about to drop the column `createdBy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdBy",
DROP COLUMN "updatedBy",
ADD COLUMN     "createdById" UUID,
ADD COLUMN     "updatedById" UUID;

-- CreateIndex
CREATE INDEX "users_createdById_idx" ON "users"("createdById");

-- CreateIndex
CREATE INDEX "users_updatedById_idx" ON "users"("updatedById");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
