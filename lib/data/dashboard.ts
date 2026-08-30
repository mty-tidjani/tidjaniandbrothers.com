import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    newThisWeek,
    auditsToSchedule,
    postsThisMonth,
    totalLeads,
    convertedLeads,
  ] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.lead.count({ where: { status: "AUDIT_PLANIFIE" } }),
    prisma.blogPost.count({
      where: { status: "PUBLISHED", publishedAt: { gte: startOfMonth } },
    }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "CONVERTI" } }),
  ]);

  const conversionRate =
    totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  return { newThisWeek, auditsToSchedule, postsThisMonth, conversionRate };
}
