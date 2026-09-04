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
    enCoursCount,
    totalQuotes,
    completedQuotes,
    dropoffGroups,
  ] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.lead.count({ where: { status: "AUDIT_PLANIFIE" } }),
    prisma.blogPost.count({
      where: { status: "PUBLISHED", publishedAt: { gte: startOfMonth } },
    }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "CONVERTI" } }),
    prisma.quoteRequest.count({
      where: { status: { in: ["SOUMIS", "DEVIS_ENVOYE"] } },
    }),
    prisma.quoteRequest.count(),
    prisma.quoteRequest.count({ where: { status: { not: "BROUILLON" } } }),
    prisma.quoteRequest.groupBy({
      by: ["currentStep"],
      where: { status: "BROUILLON" },
      _count: true,
      orderBy: { _count: { currentStep: "desc" } },
      take: 1,
    }),
  ]);

  const conversionRate =
    totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
  const completionRate =
    totalQuotes > 0 ? (completedQuotes / totalQuotes) * 100 : 0;
  const topDropoffStep = dropoffGroups[0]?.currentStep;
  const dropoffHint =
    topDropoffStep !== undefined
      ? `Abandon fréquent à l'étape ${topDropoffStep}/9`
      : undefined;

  return {
    newThisWeek,
    auditsToSchedule,
    postsThisMonth,
    conversionRate,
    enCoursCount,
    completionRate,
    dropoffHint,
  };
}
