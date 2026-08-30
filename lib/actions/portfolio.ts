"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { caseStudySchema } from "@/lib/validation/caseStudy";

function parseFormData(formData: FormData) {
  return caseStudySchema.safeParse({
    slug: formData.get("slug"),
    sector: formData.get("sector"),
    before: formData.get("before"),
    after: formData.get("after"),
    resultMetric: formData.get("resultMetric") || "",
    imagePaths: formData
      .getAll("imagePaths")
      .filter((v) => typeof v === "string" && v.length > 0),
    published: formData.get("published") === "true",
  });
}

export async function createCaseStudy(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const data = parsed.data;
  const study = await prisma.caseStudy.create({
    data: { ...data, resultMetric: data.resultMetric || null },
  });

  revalidatePath("/admin/portfolio");
  redirect(`/admin/portfolio/${study.id}`);
}

export async function updateCaseStudy(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const data = parsed.data;
  await prisma.caseStudy.update({
    where: { id },
    data: { ...data, resultMetric: data.resultMetric || null },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath(`/admin/portfolio/${id}`);
  revalidatePath("/portfolio");
}

export async function deleteCaseStudy(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.caseStudy.delete({ where: { id } });
  revalidatePath("/admin/portfolio");
}
