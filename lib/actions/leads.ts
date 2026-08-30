"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { leadNoteSchema, leadStatusUpdateSchema } from "@/lib/validation/lead";

export async function updateLeadStatus(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = leadStatusUpdateSchema.safeParse({
    leadId: formData.get("leadId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const current = await prisma.lead.findUnique({
    where: { id: parsed.data.leadId },
  });
  if (!current) return;

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: parsed.data.leadId },
      data: { status: parsed.data.status },
    }),
    prisma.leadStatusEvent.create({
      data: {
        leadId: parsed.data.leadId,
        fromStatus: current.status,
        toStatus: parsed.data.status,
        actorId: session.user.id,
      },
    }),
  ]);

  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function addLeadNote(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = leadNoteSchema.safeParse({
    leadId: formData.get("leadId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return;

  await prisma.leadNote.create({
    data: {
      leadId: parsed.data.leadId,
      body: parsed.data.body,
      authorId: session.user.id,
    },
  });

  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
}
