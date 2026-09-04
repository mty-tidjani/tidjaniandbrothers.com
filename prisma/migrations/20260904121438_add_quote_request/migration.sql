-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('BROUILLON', 'SOUMIS', 'DEVIS_ENVOYE', 'CONVERTI', 'PERDU');

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'BROUILLON',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "companyName" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "budgetMentioned" TEXT,
    "proposedAmount" INTEGER,
    "internalNote" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteStatusEvent" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "fromStatus" "QuoteStatus",
    "toStatus" "QuoteStatus" NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_sessionId_key" ON "QuoteRequest"("sessionId");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_idx" ON "QuoteRequest"("status");

-- CreateIndex
CREATE INDEX "QuoteRequest_updatedAt_idx" ON "QuoteRequest"("updatedAt");

-- AddForeignKey
ALTER TABLE "QuoteStatusEvent" ADD CONSTRAINT "QuoteStatusEvent_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteStatusEvent" ADD CONSTRAINT "QuoteStatusEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
