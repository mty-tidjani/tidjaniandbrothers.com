"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  firstIssue,
  isUniqueViolation,
  requireSmsAdmin,
  type ActionState,
} from "@/lib/sms/admin";
import { rateCardSchema, smsPackageSchema } from "@/lib/validation/sms";

export async function saveRateCard(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSmsAdmin();

  const parsed = rateCardSchema.safeParse({
    id: formData.get("id") || undefined,
    prefix: formData.get("prefix"),
    label: formData.get("label"),
    upstreamCostFcfa: formData.get("upstreamCostFcfa"),
    creditsPerPart: formData.get("creditsPerPart"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { id, ...data } = parsed.data;
  try {
    if (id) await prisma.smsRateCard.update({ where: { id }, data });
    else await prisma.smsRateCard.create({ data });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: `Le préfixe ${data.prefix} existe déjà` };
    }
    throw error;
  }

  revalidatePath("/admin/sms/pricing");
  return { success: "Tarif enregistré" };
}

export async function saveSmsPackage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSmsAdmin();

  const parsed = smsPackageSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    credits: formData.get("credits"),
    priceFcfa: formData.get("priceFcfa"),
    sortOrder: formData.get("sortOrder") || 0,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { id, ...data } = parsed.data;
  if (id) await prisma.smsPackage.update({ where: { id }, data });
  else await prisma.smsPackage.create({ data });

  revalidatePath("/admin/sms/pricing");
  // Public price list.
  revalidatePath("/services/sms");
  return { success: "Forfait enregistré" };
}
