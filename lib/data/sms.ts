import { prisma } from "@/lib/prisma";
import type { SmsAccountStatus, SmsSenderIdStatus } from "@prisma/client";

export type SmsAccountFilters = { status?: string; search?: string };

export async function getSmsAccounts(filters: SmsAccountFilters) {
  return prisma.smsAccount.findMany({
    where: {
      status: filters.status ? (filters.status as SmsAccountStatus) : undefined,
      OR: filters.search
        ? [
            { companyName: { contains: filters.search, mode: "insensitive" } },
            { contactName: { contains: filters.search, mode: "insensitive" } },
            {
              contactEmail: { contains: filters.search, mode: "insensitive" },
            },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      senderIds: { select: { value: true, status: true } },
      _count: { select: { apiKeys: { where: { revokedAt: null } } } },
    },
  });
}

export async function getSmsAccountById(id: string) {
  return prisma.smsAccount.findUnique({
    where: { id },
    include: {
      senderIds: { orderBy: { createdAt: "asc" } },
      apiKeys: {
        orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
        include: { senderId: { select: { value: true, status: true } } },
      },
      statusEvents: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true } } },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 25,
        include: {
          actor: { select: { name: true } },
          package: { select: { name: true } },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 25 },
      portalUsers: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          lastLoginAt: true,
          passwordHash: true,
        },
      },
    },
  });
}

export type SmsSenderIdFilters = { status?: string; search?: string };

export async function getSmsSenderIds(filters: SmsSenderIdFilters) {
  return prisma.smsSenderId.findMany({
    where: {
      status: filters.status
        ? (filters.status as SmsSenderIdStatus)
        : undefined,
      OR: filters.search
        ? [
            { normalized: { contains: filters.search.toUpperCase() } },
            {
              account: {
                companyName: { contains: filters.search, mode: "insensitive" },
              },
            },
          ]
        : undefined,
    },
    // Pending reviews first: that's the admin's to-do list.
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      account: { select: { id: true, companyName: true, status: true } },
      _count: { select: { apiKeys: { where: { revokedAt: null } } } },
    },
  });
}

export async function getSmsRateCards() {
  return prisma.smsRateCard.findMany({ orderBy: { prefix: "asc" } });
}

export async function getSmsPackages() {
  return prisma.smsPackage.findMany({
    orderBy: [{ sortOrder: "asc" }, { credits: "asc" }],
  });
}

export async function getSmsOverview() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [byStatus, revenue, cost, outstanding, last30, pendingSenders] =
    await Promise.all([
      prisma.smsAccount.groupBy({ by: ["status"], _count: true }),
      prisma.smsCreditTransaction.aggregate({
        where: { type: "TOPUP" },
        _sum: { amountFcfa: true },
      }),
      prisma.smsMessage.aggregate({ _sum: { upstreamCostFcfa: true } }),
      prisma.smsAccount.aggregate({ _sum: { creditBalance: true } }),
      prisma.smsMessage.aggregate({
        where: { createdAt: { gte: since } },
        _sum: { creditsCharged: true, creditsRefunded: true },
      }),
      prisma.smsSenderId.count({ where: { status: "PENDING_REVIEW" } }),
    ]);

  const revenueFcfa = revenue._sum.amountFcfa ?? 0;
  const upstreamCostFcfa = cost._sum.upstreamCostFcfa ?? 0;
  return {
    activeAccounts: byStatus.find((s) => s.status === "ACTIVE")?._count ?? 0,
    totalAccounts: byStatus.reduce((sum, s) => sum + s._count, 0),
    revenueFcfa,
    upstreamCostFcfa,
    grossProfitFcfa: revenueFcfa - upstreamCostFcfa,
    outstandingCredits: outstanding._sum.creditBalance ?? 0,
    creditsUsedLast30Days:
      (last30._sum.creditsCharged ?? 0) - (last30._sum.creditsRefunded ?? 0),
    pendingSenders,
  };
}
