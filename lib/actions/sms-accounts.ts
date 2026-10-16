"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  firstIssue,
  isUniqueViolation,
  requireSmsAdmin,
  type ActionState,
} from "@/lib/sms/admin";
import { applyCreditChange } from "@/lib/sms/credits";
import {
  smsAccountCreateSchema,
  smsAccountStatusSchema,
  smsAdjustmentSchema,
  smsTopupSchema,
} from "@/lib/validation/sms";

function optional(value: FormDataEntryValue | null) {
  return value ? String(value) : undefined;
}

export async function createSmsAccount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSmsAdmin();

  const parsed = smsAccountCreateSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    notes: optional(formData.get("notes")),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  let accountId: string;
  try {
    const account = await prisma.smsAccount.create({
      data: {
        ...parsed.data,
        statusEvents: {
          create: { toStatus: "PENDING", actorId: session.user.id },
        },
      },
    });
    accountId = account.id;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "Un compte SMS existe déjà avec cet email" };
    }
    throw error;
  }

  revalidatePath("/admin/sms");
  redirect(`/admin/sms/${accountId}`);
}

/** Activate / suspend / disable. Takes effect on the customer's next API call. */
export async function updateSmsAccountStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSmsAdmin();

  const parsed = smsAccountStatusSchema.safeParse({
    accountId: formData.get("accountId"),
    status: formData.get("status"),
    reason: optional(formData.get("reason")),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const current = await prisma.smsAccount.findUnique({
    where: { id: parsed.data.accountId },
  });
  if (!current) return { error: "Compte introuvable" };
  if (current.status === parsed.data.status) {
    return { error: "Le compte a déjà ce statut" };
  }

  await prisma.$transaction([
    prisma.smsAccount.update({
      where: { id: current.id },
      data: { status: parsed.data.status },
    }),
    prisma.smsAccountStatusEvent.create({
      data: {
        accountId: current.id,
        fromStatus: current.status,
        toStatus: parsed.data.status,
        reason: parsed.data.reason,
        actorId: session.user.id,
      },
    }),
  ]);

  revalidatePath(`/admin/sms/${current.id}`);
  revalidatePath("/admin/sms");
  return { success: "Statut mis à jour" };
}

/** Records a paid credit purchase (payment itself is collected out-of-band). */
export async function topUpSmsAccount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSmsAdmin();

  const packageId = optional(formData.get("packageId"));
  const pkg = packageId
    ? await prisma.smsPackage.findUnique({ where: { id: packageId } })
    : null;
  if (packageId && !pkg) return { error: "Forfait introuvable" };

  // A package fills in credits/price; explicit values only for custom deals.
  const parsed = smsTopupSchema.safeParse({
    accountId: formData.get("accountId"),
    packageId,
    credits: pkg ? pkg.credits : formData.get("credits"),
    amountFcfa: pkg ? pkg.priceFcfa : formData.get("amountFcfa"),
    note: optional(formData.get("note")),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const balance = await prisma.$transaction((tx) =>
    applyCreditChange(tx, {
      accountId: parsed.data.accountId,
      credits: parsed.data.credits,
      type: "TOPUP",
      amountFcfa: parsed.data.amountFcfa,
      packageId: parsed.data.packageId,
      note: parsed.data.note,
      actorId: session.user.id,
    }),
  );
  if (balance === null) return { error: "Compte introuvable" };

  revalidatePath(`/admin/sms/${parsed.data.accountId}`);
  revalidatePath("/admin/sms");
  return {
    success: `${parsed.data.credits} crédits ajoutés — nouveau solde : ${balance}`,
  };
}

/** Manual correction, either sign. Can't take the balance below zero. */
export async function adjustSmsCredits(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSmsAdmin();

  const parsed = smsAdjustmentSchema.safeParse({
    accountId: formData.get("accountId"),
    credits: formData.get("credits"),
    note: formData.get("note"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const balance = await prisma.$transaction((tx) =>
    applyCreditChange(tx, {
      accountId: parsed.data.accountId,
      credits: parsed.data.credits,
      type: "ADJUSTMENT",
      note: parsed.data.note,
      actorId: session.user.id,
    }),
  );
  if (balance === null) {
    return { error: "Solde insuffisant pour ce retrait" };
  }

  revalidatePath(`/admin/sms/${parsed.data.accountId}`);
  return { success: `Solde ajusté — nouveau solde : ${balance}` };
}
