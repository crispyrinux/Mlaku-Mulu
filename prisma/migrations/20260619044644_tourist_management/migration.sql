/*
  Warnings:

  - You are about to drop the column `isActive` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Tourist` table. All the data in the column will be lost.
  - Added the required column `createdByEmployeeId` to the `Tourist` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TouristStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED');

-- DropIndex
DROP INDEX "Tourist_email_key";

-- AlterTable
ALTER TABLE "Tourist" DROP COLUMN "isActive",
DROP COLUMN "password",
DROP COLUMN "phoneNumber",
ADD COLUMN     "createdByEmployeeId" UUID NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "TouristStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedByEmployeeId" UUID,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Tourist_createdByEmployeeId_idx" ON "Tourist"("createdByEmployeeId");

-- CreateIndex
CREATE INDEX "Tourist_updatedByEmployeeId_idx" ON "Tourist"("updatedByEmployeeId");

-- AddForeignKey
ALTER TABLE "Tourist" ADD CONSTRAINT "Tourist_createdByEmployeeId_fkey" FOREIGN KEY ("createdByEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tourist" ADD CONSTRAINT "Tourist_updatedByEmployeeId_fkey" FOREIGN KEY ("updatedByEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
