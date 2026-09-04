"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  devisAdminDetailsSchema,
  devisStatusUpdateSchema,
} from "@/lib/validation/devis";

export async function updateDevisStatus(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = devisStatusUpdateSchema.safeParse({
    devisId: formData.get("devisId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const current = await prisma.quoteRequest.findUnique({
    where: { id: parsed.data.devisId },
  });
  if (!current) return;

  await prisma.$transaction([
    prisma.quoteRequest.update({
      where: { id: parsed.data.devisId },
      data: { status: parsed.data.status },
    }),
    prisma.quoteStatusEvent.create({
      data: {
        quoteId: parsed.data.devisId,
        fromStatus: current.status,
        toStatus: parsed.data.status,
        actorId: session.user.id,
      },
    }),
  ]);

  revalidatePath(`/admin/devis/${parsed.data.devisId}`);
  revalidatePath("/admin/devis");
  revalidatePath("/admin");
}

export async function updateDevisAdminDetails(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = devisAdminDetailsSchema.safeParse({
    devisId: formData.get("devisId"),
    proposedAmount: formData.get("proposedAmount") || undefined,
    internalNote: formData.get("internalNote") || undefined,
  });
  if (!parsed.success) return;

  await prisma.quoteRequest.update({
    where: { id: parsed.data.devisId },
    data: {
      proposedAmount: parsed.data.proposedAmount ?? null,
      internalNote: parsed.data.internalNote || null,
    },
  });

  revalidatePath(`/admin/devis/${parsed.data.devisId}`);
}
