"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  firstIssue,
  isUniqueViolation,
  requireSmsAdmin,
  type ActionState,
} from "@/lib/sms/admin";
import { SENDER_ID_TRANSITIONS } from "@/lib/sms/sender-transitions";
import {
  senderIdActionSchema,
  senderIdCreateSchema,
} from "@/lib/validation/sms";

function revalidateSenderPages(accountId: string) {
  revalidatePath(`/admin/sms/${accountId}`);
  revalidatePath("/admin/sms/senders");
  revalidatePath("/admin/sms");
}

export async function createSenderId(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSmsAdmin();

  const parsed = senderIdCreateSchema.safeParse({
    accountId: formData.get("accountId"),
    value: formData.get("value"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  try {
    await prisma.smsSenderId.create({
      data: {
        accountId: parsed.data.accountId,
        value: parsed.data.value,
        normalized: parsed.data.value.toUpperCase(),
        statusEvents: {
          create: { toStatus: "PENDING_REVIEW", actorId: session.user.id },
        },
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: `« ${parsed.data.value} » est déjà enregistré` };
    }
    throw error;
  }

  revalidateSenderPages(parsed.data.accountId);
  return { success: "Nom d'expéditeur ajouté, en attente de validation" };
}

export async function updateSenderIdStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSmsAdmin();

  const parsed = senderIdActionSchema.safeParse({
    senderIdId: formData.get("senderIdId"),
    action: formData.get("action"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const current = await prisma.smsSenderId.findUnique({
    where: { id: parsed.data.senderIdId },
  });
  if (!current) return { error: "Nom d'expéditeur introuvable" };

  const transition = SENDER_ID_TRANSITIONS[parsed.data.action];
  if (!transition.from.includes(current.status)) {
    return { error: "Action impossible depuis ce statut" };
  }

  await prisma.$transaction([
    prisma.smsSenderId.update({
      where: { id: current.id },
      data: {
        status: transition.to,
        statusReason: parsed.data.reason ?? null,
      },
    }),
    prisma.smsSenderIdStatusEvent.create({
      data: {
        senderIdId: current.id,
        fromStatus: current.status,
        toStatus: transition.to,
        reason: parsed.data.reason,
        actorId: session.user.id,
      },
    }),
  ]);

  revalidateSenderPages(current.accountId);
  return { success: "Statut mis à jour" };
}
