-- CreateEnum
CREATE TYPE "SmsAccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "SmsSenderIdStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'BLOCKED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SmsCreditTxnType" AS ENUM ('TOPUP', 'DEBIT', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "SmsMessageStatus" AS ENUM ('PENDING', 'SENT', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "SmsEncoding" AS ENUM ('GSM7', 'UNICODE');

-- CreateTable
CREATE TABLE "SmsAccount" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "status" "SmsAccountStatus" NOT NULL DEFAULT 'PENDING',
    "creditBalance" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsAccountStatusEvent" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "fromStatus" "SmsAccountStatus",
    "toStatus" "SmsAccountStatus" NOT NULL,
    "reason" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsAccountStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsSenderId" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "status" "SmsSenderIdStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "statusReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsSenderId_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsSenderIdStatusEvent" (
    "id" TEXT NOT NULL,
    "senderIdId" TEXT NOT NULL,
    "fromStatus" "SmsSenderIdStatus",
    "toStatus" "SmsSenderIdStatus" NOT NULL,
    "reason" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsSenderIdStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsApiKey" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "senderIdId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsMessage" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "senderIdId" TEXT NOT NULL,
    "senderValue" TEXT NOT NULL,
    "recipients" TEXT[],
    "body" TEXT NOT NULL,
    "encoding" "SmsEncoding" NOT NULL,
    "parts" INTEGER NOT NULL,
    "creditsCharged" INTEGER NOT NULL,
    "creditsRefunded" INTEGER NOT NULL DEFAULT 0,
    "upstreamCostFcfa" INTEGER NOT NULL DEFAULT 0,
    "status" "SmsMessageStatus" NOT NULL DEFAULT 'PENDING',
    "upstreamMessageIds" TEXT[],
    "errorCode" TEXT,
    "batches" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsCreditTransaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" "SmsCreditTxnType" NOT NULL,
    "credits" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "amountFcfa" INTEGER,
    "packageId" TEXT,
    "messageId" TEXT,
    "note" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsCreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsRateCard" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "upstreamCostFcfa" INTEGER NOT NULL,
    "creditsPerPart" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsRateCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "priceFcfa" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmsAccount_contactEmail_key" ON "SmsAccount"("contactEmail");

-- CreateIndex
CREATE INDEX "SmsAccount_status_idx" ON "SmsAccount"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SmsSenderId_normalized_key" ON "SmsSenderId"("normalized");

-- CreateIndex
CREATE INDEX "SmsSenderId_status_idx" ON "SmsSenderId"("status");

-- CreateIndex
CREATE INDEX "SmsSenderId_accountId_idx" ON "SmsSenderId"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "SmsApiKey_keyHash_key" ON "SmsApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "SmsApiKey_accountId_idx" ON "SmsApiKey"("accountId");

-- CreateIndex
CREATE INDEX "SmsMessage_accountId_createdAt_idx" ON "SmsMessage"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "SmsMessage_status_idx" ON "SmsMessage"("status");

-- CreateIndex
CREATE INDEX "SmsCreditTransaction_accountId_createdAt_idx" ON "SmsCreditTransaction"("accountId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SmsRateCard_prefix_key" ON "SmsRateCard"("prefix");

-- AddForeignKey
ALTER TABLE "SmsAccountStatusEvent" ADD CONSTRAINT "SmsAccountStatusEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SmsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsAccountStatusEvent" ADD CONSTRAINT "SmsAccountStatusEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsSenderId" ADD CONSTRAINT "SmsSenderId_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SmsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsSenderIdStatusEvent" ADD CONSTRAINT "SmsSenderIdStatusEvent_senderIdId_fkey" FOREIGN KEY ("senderIdId") REFERENCES "SmsSenderId"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsSenderIdStatusEvent" ADD CONSTRAINT "SmsSenderIdStatusEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsApiKey" ADD CONSTRAINT "SmsApiKey_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SmsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsApiKey" ADD CONSTRAINT "SmsApiKey_senderIdId_fkey" FOREIGN KEY ("senderIdId") REFERENCES "SmsSenderId"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SmsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "SmsApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_senderIdId_fkey" FOREIGN KEY ("senderIdId") REFERENCES "SmsSenderId"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCreditTransaction" ADD CONSTRAINT "SmsCreditTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SmsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCreditTransaction" ADD CONSTRAINT "SmsCreditTransaction_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "SmsPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCreditTransaction" ADD CONSTRAINT "SmsCreditTransaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "SmsMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCreditTransaction" ADD CONSTRAINT "SmsCreditTransaction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

