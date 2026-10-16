"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  isUniqueViolation,
  requireSmsAdmin,
  type ActionState,
} from "@/lib/sms/admin";
import { generatePortalToken } from "@/lib/sms-portal/session";

const LINK_DAYS = 7;

/**
 * Single-use "set your password" link for the account's portal user —
 * first access for admin-created accounts, or a reset. Creates the portal
 * user from the account contact if there isn't one yet. Returns the path
 * only; the admin UI prefixes the current origin.
 */
export async function issuePortalAccessLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSmsAdmin();

  const account = await prisma.smsAccount.findUnique({
    where: { id: String(formData.get("accountId") ?? "") },
    include: { portalUsers: { orderBy: { createdAt: "asc" }, take: 1 } },
  });
  if (!account) return { error: "Compte introuvable" };
  if (account.status === "DISABLED") {
    return { error: "Réactivez le compte avant de donner un accès." };
  }

  let user = account.portalUsers[0];
  if (!user) {
    try {
      user = await prisma.smsPortalUser.create({
        data: {
          accountId: account.id,
          name: account.contactName,
          email: account.contactEmail.toLowerCase(),
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return {
          error: `L'email ${account.contactEmail} est déjà utilisé par un autre compte client.`,
        };
      }
      throw error;
    }
  }

  const { token, tokenHash } = generatePortalToken();
  await prisma.$transaction([
    // Only the newest link works.
    prisma.smsPortalToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.smsPortalToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + LINK_DAYS * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  revalidatePath(`/admin/sms/${account.id}`);
  return { secret: `/sms/acces?token=${token}` };
}
