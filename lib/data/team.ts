import { prisma } from "@/lib/prisma";

export async function getTeamMembers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function getPendingInvites() {
  return prisma.teamInvite.findMany({
    where: { acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
}
