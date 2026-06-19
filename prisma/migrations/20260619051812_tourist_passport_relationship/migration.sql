/*
  Warnings:

  - You are about to drop the column `passportNumber` on the `Tourist` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Tourist_passportNumber_key";

-- AlterTable
ALTER TABLE "Tourist" DROP COLUMN "passportNumber";

-- CreateTable
CREATE TABLE "Passport" (
    "id" UUID NOT NULL,
    "touristId" UUID NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "placeOfIssue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Passport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Passport_touristId_key" ON "Passport"("touristId");

-- CreateIndex
CREATE UNIQUE INDEX "Passport_passportNumber_key" ON "Passport"("passportNumber");

-- AddForeignKey
ALTER TABLE "Passport" ADD CONSTRAINT "Passport_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "Tourist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
