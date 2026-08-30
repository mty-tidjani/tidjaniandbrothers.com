"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validation/blogPost";

function parseFormData(formData: FormData) {
  return blogPostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    contentHtml: formData.get("contentHtml"),
    coverImagePath: formData.get("coverImagePath") || undefined,
    category: formData.get("category"),
    metaTitle: formData.get("metaTitle") || "",
    metaDescription: formData.get("metaDescription") || "",
    status: formData.get("status"),
  });
}

export async function createBlogPost(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const data = parsed.data;
  const post = await prisma.blogPost.create({
    data: {
      ...data,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      coverImagePath: data.coverImagePath || null,
      authorId: session.user.id,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${post.id}`);
}

export async function updateBlogPost(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const data = parsed.data;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw new Error("Article introuvable");

  await prisma.blogPost.update({
    where: { id },
    data: {
      ...data,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      coverImagePath: data.coverImagePath || null,
      publishedAt:
        data.status === "PUBLISHED"
          ? (existing.publishedAt ?? new Date())
          : existing.publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
}

export async function deleteBlogPost(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
}

export async function duplicateBlogPost(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const id = formData.get("id");
  if (typeof id !== "string") return;

  const original = await prisma.blogPost.findUnique({ where: { id } });
  if (!original) return;

  await prisma.blogPost.create({
    data: {
      title: `${original.title} (copie)`,
      slug: `${original.slug}-copie-${Date.now()}`,
      excerpt: original.excerpt,
      contentHtml: original.contentHtml,
      coverImagePath: original.coverImagePath,
      category: original.category,
      metaTitle: original.metaTitle,
      metaDescription: original.metaDescription,
      status: "DRAFT",
      authorId: session.user.id,
    },
  });

  revalidatePath("/admin/blog");
}

export async function toggleBlogPostStatus(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const id = formData.get("id");
  if (typeof id !== "string") return;

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return;

  const nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.blogPost.update({
    where: { id },
    data: {
      status: nextStatus,
      publishedAt:
        nextStatus === "PUBLISHED"
          ? (post.publishedAt ?? new Date())
          : post.publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
