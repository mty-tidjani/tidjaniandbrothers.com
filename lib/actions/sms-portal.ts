"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  firstIssue,
  isUniqueViolation,
  type ActionState,
} from "@/lib/sms/admin";
import { SmsApiError } from "@/lib/sms/errors";
import { sendSms } from "@/lib/sms/gateway";
import { generateApiKey } from "@/lib/sms/keys";
import { requirePortalSession } from "@/lib/sms-portal/session";
import { portalErrorMessage } from "@/lib/sms-portal/messages";
import { sendSmsSchema } from "@/lib/validation/sms";
import {
  portalApiKeySchema,
  portalChangePasswordSchema,
  portalProfileSchema,
  portalSenderRequestSchema,
  splitRecipients,
} from "@/lib/validation/sms-portal";

// Limits on what a customer can create on their own, so a public signup
// can't squat dozens of sender names or mint unlimited keys.
const MAX_SENDER_IDS = 10;
const MAX_PENDING_SENDER_IDS = 3;
const MAX_ACTIVE_KEYS = 10;

export async function sendPortalSms(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { account } = await requirePortalSession();

  if (account.status !== "ACTIVE") {
    return { error: "Votre compte n'est pas encore actif : contactez-nous." };
  }

  const senderId = await prisma.smsSenderId.findFirst({
    where: {
      id: String(formData.get("senderIdId") ?? ""),
      accountId: account.id,
    },
  });
  if (!senderId) return { error: "Choisissez un nom d'expéditeur." };
  if (senderId.status !== "APPROVED") {
    return { error: "Ce nom d'expéditeur n'est pas approuvé." };
  }

  const parsed = sendSmsSchema.safeParse({
    to: splitRecipients(String(formData.get("to") ?? "")),
    message: String(formData.get("message") ?? ""),
    encoding: "auto",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  try {
    const { message, balance } = await sendSms(
      {
        accountId: account.id,
        apiKeyId: null,
        senderId: { id: senderId.id, value: senderId.value },
      },
      parsed.data,
    );
    revalidatePath("/sms", "layout");

    const recipients = message.recipients.length;
    const used = message.creditsCharged - message.creditsRefunded;
    if (message.status === "FAILED") {
      return {
        error: "L'envoi a échoué. Vos crédits ont été remboursés.",
      };
    }
    if (message.status === "PARTIAL") {
      return {
        success: `Envoi partiel : une partie des destinataires a échoué (crédits remboursés). ${used} crédits utilisés, solde : ${balance}.`,
      };
    }
    return {
      success: `Message envoyé à ${recipients} destinataire${recipients > 1 ? "s" : ""} · ${used} crédit${used > 1 ? "s" : ""} utilisé${used > 1 ? "s" : ""} · solde : ${balance}.`,
    };
  } catch (error) {
    if (error instanceof SmsApiError)
      return { error: portalErrorMessage(error) };
    throw error;
  }
}

export async function requestPortalSenderId(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { account } = await requirePortalSession();

  const parsed = portalSenderRequestSchema.safeParse({
    value: formData.get("value"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const [total, pending] = await Promise.all([
    prisma.smsSenderId.count({ where: { accountId: account.id } }),
    prisma.smsSenderId.count({
      where: { accountId: account.id, status: "PENDING_REVIEW" },
    }),
  ]);
  if (total >= MAX_SENDER_IDS) {
    return { error: `Maximum ${MAX_SENDER_IDS} noms d'expéditeur par compte.` };
  }
  if (pending >= MAX_PENDING_SENDER_IDS) {
    return {
      error: `Vous avez déjà ${pending} demandes en attente de validation.`,
    };
  }

  try {
    await prisma.smsSenderId.create({
      data: {
        accountId: account.id,
        value: parsed.data.value,
        normalized: parsed.data.value.toUpperCase(),
        statusEvents: {
          create: { toStatus: "PENDING_REVIEW", reason: "Demande client" },
        },
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: `« ${parsed.data.value} » n'est pas disponible.` };
    }
    throw error;
  }

  revalidatePath("/sms/expediteurs");
  revalidatePath("/admin/sms/senders");
  return {
    success: "Demande envoyée. Nous vous prévenons dès qu'elle est validée.",
  };
}

export async function createPortalApiKey(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { account } = await requirePortalSession();

  if (account.status === "SUSPENDED") {
    return { error: "Votre compte est suspendu : contactez-nous." };
  }

  const parsed = portalApiKeySchema.safeParse({
    senderIdId: formData.get("senderIdId"),
    label: formData.get("label"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const senderId = await prisma.smsSenderId.findFirst({
    where: { id: parsed.data.senderIdId, accountId: account.id },
  });
  if (!senderId || senderId.status !== "APPROVED") {
    return { error: "Choisissez un nom d'expéditeur approuvé." };
  }

  const activeKeys = await prisma.smsApiKey.count({
    where: { accountId: account.id, revokedAt: null },
  });
  if (activeKeys >= MAX_ACTIVE_KEYS) {
    return {
      error: `Maximum ${MAX_ACTIVE_KEYS} clés actives : révoquez-en une d'abord.`,
    };
  }

  const { secret, keyPrefix, keyHash } = generateApiKey();
  await prisma.smsApiKey.create({
    data: {
      accountId: account.id,
      senderIdId: senderId.id,
      label: parsed.data.label,
      keyPrefix,
      keyHash,
    },
  });

  revalidatePath("/sms/cles-api");
  return { secret };
}

export async function revokePortalApiKey(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { account } = await requirePortalSession();

  // Scoped to the account: another customer's key id simply matches nothing.
  const { count } = await prisma.smsApiKey.updateMany({
    where: {
      id: String(formData.get("keyId") ?? ""),
      accountId: account.id,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
  if (count === 0) return { error: "Clé introuvable ou déjà révoquée." };

  revalidatePath("/sms/cles-api");
  return { success: "Clé révoquée." };
}

export async function updatePortalProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, account } = await requirePortalSession();

  const parsed = portalProfileSchema.safeParse({
    name: formData.get("name"),
    contactPhone: formData.get("contactPhone"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await prisma.$transaction([
    prisma.smsPortalUser.update({
      where: { id: user.id },
      data: { name: parsed.data.name },
    }),
    prisma.smsAccount.update({
      where: { id: account.id },
      data: {
        contactName: parsed.data.name,
        contactPhone: parsed.data.contactPhone,
      },
    }),
  ]);

  revalidatePath("/sms", "layout");
  return { success: "Informations mises à jour." };
}

export async function changePortalPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, sessionId } = await requirePortalSession();

  const parsed = portalChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const record = await prisma.smsPortalUser.findUniqueOrThrow({
    where: { id: user.id },
  });
  const valid =
    record.passwordHash &&
    (await bcrypt.compare(parsed.data.currentPassword, record.passwordHash));
  if (!valid) return { error: "Mot de passe actuel incorrect." };

  await prisma.$transaction([
    prisma.smsPortalUser.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
    }),
    // Sign out every other device, keep this one.
    prisma.smsPortalSession.deleteMany({
      where: { userId: user.id, id: { not: sessionId } },
    }),
  ]);

  return {
    success: "Mot de passe mis à jour. Vos autres sessions sont déconnectées.",
  };
}
