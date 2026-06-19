-- CreateEnum
CREATE TYPE "VisaApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "VisaApplication" (
    "id" UUID NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "touristId" UUID NOT NULL,
    "country" TEXT NOT NULL,
    "visaType" TEXT NOT NULL,
    "status" "VisaApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submissionDate" TIMESTAMP(3),
    "decisionDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdByEmployeeId" UUID NOT NULL,
    "updatedByEmployeeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VisaApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VisaApplication_applicationNumber_key" ON "VisaApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "VisaApplication_touristId_idx" ON "VisaApplication"("touristId");

-- CreateIndex
CREATE INDEX "VisaApplication_createdByEmployeeId_idx" ON "VisaApplication"("createdByEmployeeId");

-- CreateIndex
CREATE INDEX "VisaApplication_updatedByEmployeeId_idx" ON "VisaApplication"("updatedByEmployeeId");

-- AddForeignKey
ALTER TABLE "VisaApplication" ADD CONSTRAINT "VisaApplication_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "Tourist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaApplication" ADD CONSTRAINT "VisaApplication_createdByEmployeeId_fkey" FOREIGN KEY ("createdByEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaApplication" ADD CONSTRAINT "VisaApplication_updatedByEmployeeId_fkey" FOREIGN KEY ("updatedByEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
