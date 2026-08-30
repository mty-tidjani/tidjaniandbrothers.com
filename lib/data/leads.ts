import { prisma } from "@/lib/prisma";
import type { LeadStatus } from "@prisma/client";

export type LeadFilters = {
  status?: string;
  service?: string;
  search?: string;
};

export async function getRecentLeads(limit = 5) {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getFilteredLeads(filters: LeadFilters) {
  return prisma.lead.findMany({
    where: {
      status: filters.status ? (filters.status as LeadStatus) : undefined,
      servicesWanted: filters.service ? { has: filters.service } : undefined,
      OR: filters.search
        ? [
            { fullName: { contains: filters.search, mode: "insensitive" } },
            { company: { contains: filters.search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
      statusEvents: { orderBy: { createdAt: "desc" } },
    },
  });
}
