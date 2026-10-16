import type { Prisma, SmsMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Every query here takes the session's accountId: a portal page can never
// read another customer's data.

export const PORTAL_PAGE_SIZE = 25;
const USAGE_DAYS = 30;
// Cameroon is UTC+1 with no DST; charts and day filters use local days.
const TIMEZONE = "Africa/Douala";

export type UsageDay = { day: string; credits: number; messages: number };

function localDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(date);
}

export async function getPortalOverview(accountId: string) {
  const since = new Date(Date.now() - USAGE_DAYS * 24 * 60 * 60 * 1000);

  const [totals, byStatus, rows, recent, senders] = await Promise.all([
    prisma.smsMessage.aggregate({
      where: { accountId, createdAt: { gte: since } },
      _count: true,
      _sum: { creditsCharged: true, creditsRefunded: true },
    }),
    prisma.smsMessage.groupBy({
      by: ["status"],
      where: { accountId, createdAt: { gte: since } },
      _count: true,
    }),
    prisma.$queryRaw<{ day: string; credits: number; messages: number }[]>`
      SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TIMEZONE}, 'YYYY-MM-DD') AS day,
             SUM("creditsCharged" - "creditsRefunded")::int AS credits,
             COUNT(*)::int AS messages
      FROM "SmsMessage"
      WHERE "accountId" = ${accountId} AND "createdAt" >= ${since}
      GROUP BY 1
    `,
    prisma.smsMessage.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.smsSenderId.groupBy({
      by: ["status"],
      where: { accountId },
      _count: true,
    }),
  ]);

  // Fill the days with no traffic so the chart has one column per day.
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const usage: UsageDay[] = [];
  for (let i = USAGE_DAYS - 1; i >= 0; i--) {
    const day = localDayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    usage.push(byDay.get(day) ?? { day, credits: 0, messages: 0 });
  }

  const count = (status: SmsMessageStatus) =>
    byStatus.find((s) => s.status === status)?._count ?? 0;
  const sent = count("SENT") + count("PARTIAL");

  return {
    messages: totals._count,
    creditsUsed:
      (totals._sum.creditsCharged ?? 0) - (totals._sum.creditsRefunded ?? 0),
    successRate: totals._count > 0 ? (sent / totals._count) * 100 : null,
    usage,
    recent,
    approvedSenders: senders.find((s) => s.status === "APPROVED")?._count ?? 0,
    pendingSenders:
      senders.find((s) => s.status === "PENDING_REVIEW")?._count ?? 0,
  };
}

export type PortalMessageFilters = {
  status?: string;
  q?: string;
  from?: string;
  to?: string;
};

const STATUSES = ["PENDING", "SENT", "PARTIAL", "FAILED"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** `from`/`to` are inclusive local (Douala, UTC+1) days. */
function messageWhere(
  accountId: string,
  filters: PortalMessageFilters,
): Prisma.SmsMessageWhereInput {
  const digits = filters.q?.replace(/\D/g, "");
  return {
    accountId,
    status: STATUSES.includes(filters.status ?? "")
      ? (filters.status as SmsMessageStatus)
      : undefined,
    // Stored numbers are normalised digits, so match on digits only.
    recipients: digits ? { has: digits } : undefined,
    createdAt:
      (filters.from && DATE_RE.test(filters.from)) ||
      (filters.to && DATE_RE.test(filters.to))
        ? {
            gte:
              filters.from && DATE_RE.test(filters.from)
                ? new Date(`${filters.from}T00:00:00+01:00`)
                : undefined,
            lt:
              filters.to && DATE_RE.test(filters.to)
                ? new Date(
                    new Date(`${filters.to}T00:00:00+01:00`).getTime() +
                      24 * 60 * 60 * 1000,
                  )
                : undefined,
          }
        : undefined,
  };
}

export async function getPortalMessages(
  accountId: string,
  filters: PortalMessageFilters,
  page: number,
) {
  const where = messageWhere(accountId, filters);
  const [items, total] = await Promise.all([
    prisma.smsMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PORTAL_PAGE_SIZE,
      take: PORTAL_PAGE_SIZE,
    }),
    prisma.smsMessage.count({ where }),
  ]);
  return {
    items,
    total,
    pages: Math.max(1, Math.ceil(total / PORTAL_PAGE_SIZE)),
  };
}

export const EXPORT_LIMIT = 10_000;

export async function getPortalMessagesForExport(
  accountId: string,
  filters: PortalMessageFilters,
) {
  return prisma.smsMessage.findMany({
    where: messageWhere(accountId, filters),
    orderBy: { createdAt: "desc" },
    take: EXPORT_LIMIT,
  });
}

export async function getPortalMessage(accountId: string, id: string) {
  return prisma.smsMessage.findFirst({ where: { id, accountId } });
}

export async function getPortalTransactions(accountId: string, page: number) {
  const where = { accountId };
  const [items, total] = await Promise.all([
    prisma.smsCreditTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PORTAL_PAGE_SIZE,
      take: PORTAL_PAGE_SIZE,
      include: { package: { select: { name: true } } },
    }),
    prisma.smsCreditTransaction.count({ where }),
  ]);
  return {
    items,
    total,
    pages: Math.max(1, Math.ceil(total / PORTAL_PAGE_SIZE)),
  };
}

export async function getPortalSenderIds(accountId: string) {
  return prisma.smsSenderId.findMany({
    where: { accountId },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { apiKeys: { where: { revokedAt: null } } } },
    },
  });
}

export async function getPortalApiKeys(accountId: string) {
  return prisma.smsApiKey.findMany({
    where: { accountId },
    orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
    include: { senderId: { select: { value: true, status: true } } },
  });
}

export async function getPublicSmsPackages() {
  return prisma.smsPackage.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { credits: "asc" }],
    select: { id: true, name: true, credits: true, priceFcfa: true },
  });
}
