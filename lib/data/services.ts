import { prisma } from "@/lib/prisma";

export async function getServiceTiers() {
  return prisma.serviceTier.findMany({
    where: { isMaintenance: false },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getMaintenancePlan() {
  return prisma.serviceTier.findFirst({
    where: { isMaintenance: true },
  });
}
