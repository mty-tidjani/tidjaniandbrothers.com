"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function saveServiceTiers(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    throw new Error("Unauthorized");

  const ids = formData.getAll("id") as string[];

  for (const id of ids) {
    const name = String(formData.get(`name-${id}`) ?? "");
    const priceMin = Number(formData.get(`priceMin-${id}`) ?? 0);
    const priceMaxRaw = formData.get(`priceMax-${id}`);
    const priceMax = priceMaxRaw ? Number(priceMaxRaw) : null;
    const maxUsers = String(formData.get(`maxUsers-${id}`) ?? "");
    const featuresRaw = String(formData.get(`features-${id}`) ?? "");
    const features = featuresRaw
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    await prisma.serviceTier.update({
      where: { id },
      data: { name, priceMin, priceMax, maxUsers, features },
    });
  }

  revalidatePath("/admin/services");
  revalidatePath("/services/odoo");
}
