import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().trim().min(3, "Le titre est requis"),
  slug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules, tirets)"),
  excerpt: z.string().trim().min(10, "L'extrait est requis"),
  contentHtml: z.string().trim().min(20, "Le contenu est requis"),
  coverImagePath: z.string().optional().nullable(),
  category: z.enum(["ODOO", "DIGITALISATION", "ACTUALITES"]),
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;
