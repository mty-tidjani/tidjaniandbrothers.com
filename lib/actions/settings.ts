"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { companySettingsSchema } from "@/lib/validation/settings";
import { changePasswordSchema } from "@/lib/validation/auth";

export async function updateCompanySettings(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    throw new Error("Unauthorized");

  const parsed = companySettingsSchema.safeParse({
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    facebookUrl: formData.get("facebookUrl") || "",
    defaultLocale: formData.get("defaultLocale"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function changeOwnPassword(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false as const, error: "Utilisateur introuvable" };

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid)
    return { ok: false as const, error: "Mot de passe actuel incorrect" };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { ok: true as const };
}
