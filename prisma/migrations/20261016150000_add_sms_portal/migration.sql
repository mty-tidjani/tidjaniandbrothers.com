-- CreateTable
CREATE TABLE "SmsPortalUser" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsPortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsPortalSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsPortalSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsPortalToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsPortalToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmsPortalUser_email_key" ON "SmsPortalUser"("email");

-- CreateIndex
CREATE INDEX "SmsPortalUser_accountId_idx" ON "SmsPortalUser"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "SmsPortalSession_tokenHash_key" ON "SmsPortalSession"("tokenHash");

-- CreateIndex
CREATE INDEX "SmsPortalSession_userId_idx" ON "SmsPortalSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SmsPortalToken_tokenHash_key" ON "SmsPortalToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "SmsPortalUser" ADD CONSTRAINT "SmsPortalUser_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SmsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsPortalSession" ADD CONSTRAINT "SmsPortalSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SmsPortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsPortalToken" ADD CONSTRAINT "SmsPortalToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SmsPortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

