"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { firstIssue, requireSmsAdmin, type ActionState } from "@/lib/sms/admin";
import { generateApiKey } from "@/lib/sms/keys";
import { apiKeyIssueSchema } from "@/lib/validation/sms";

/** Returns the secret exactly once — only its SHA-256 is stored. */
export async function issueApiKey(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSmsAdmin();

  const parsed = apiKeyIssueSchema.safeParse({
    senderIdId: formData.get("senderIdId"),
    label: formData.get("label"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const senderId = await prisma.smsSenderId.findUnique({
    where: { id: parsed.data.senderIdId },
  });
  if (!senderId) return { error: "Nom d'expéditeur introuvable" };
  if (senderId.status === "BLOCKED" || senderId.status === "REJECTED") {
    return { error: "Impossible d'émettre une clé pour ce nom d'expéditeur" };
  }

  const { secret, keyPrefix, keyHash } = generateApiKey();
  await prisma.smsApiKey.create({
    data: {
      accountId: senderId.accountId,
      senderIdId: senderId.id,
      label: parsed.data.label,
      keyPrefix,
      keyHash,
    },
  });

  revalidatePath(`/admin/sms/${senderId.accountId}`);
  return { secret };
}

export async function revokeApiKey(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSmsAdmin();

  const keyId = String(formData.get("keyId") ?? "");
  const key = await prisma.smsApiKey.findUnique({ where: { id: keyId } });
  if (!key) return { error: "Clé introuvable" };
  if (key.revokedAt) return { error: "Clé déjà révoquée" };

  await prisma.smsApiKey.update({
    where: { id: key.id },
    data: { revokedAt: new Date() },
  });

  revalidatePath(`/admin/sms/${key.accountId}`);
  return { success: "Clé révoquée" };
}
