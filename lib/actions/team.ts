"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { teamInviteSchema } from "@/lib/validation/team";

/**
 * No email provider is configured yet — the invite is recorded and its
 * (single-use) link is logged server-side rather than emailed.
 */
export async function inviteTeamMember(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    throw new Error("Unauthorized");

  const parsed = teamInviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.teamInvite.create({
    data: {
      email: parsed.data.email,
      role: parsed.data.role,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    },
  });

  console.info(
    `[team-invite] Invitation pour ${parsed.data.email} (${parsed.data.role}): /admin/accept-invite?token=${token}`,
  );

  revalidatePath("/admin/team");
}
