import { prisma } from "@/lib/prisma";
import type { QuoteStatus } from "@prisma/client";

export type DevisFilters = {
  status?: string;
  step?: string;
};

export async function getFilteredDevis(filters: DevisFilters) {
  return prisma.quoteRequest.findMany({
    where: {
      status: filters.status ? (filters.status as QuoteStatus) : undefined,
      currentStep: filters.step ? Number(filters.step) : undefined,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getDevisById(id: string) {
  return prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      statusEvents: { orderBy: { createdAt: "desc" } },
    },
  });
}
