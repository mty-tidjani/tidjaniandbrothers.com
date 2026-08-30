"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation/auth";

/**
 * Email delivery isn't wired up yet (no provider configured) — the reset
 * link is logged server-side instead of sent. Always returns the same
 * generic result so the UI can't be used to enumerate registered emails.
 */
export async function requestPasswordReset(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { ok: false as const };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1h
      },
    });
    console.info(
      `[password-reset] Lien de réinitialisation pour ${user.email}: /admin/reset-password?token=${token}`,
    );
  }

  return { ok: true as const };
}
