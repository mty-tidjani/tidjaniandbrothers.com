import { z } from "zod";

export const caseStudySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules, tirets)"),
  sector: z.string().trim().min(2, "Le secteur est requis"),
  before: z.string().trim().min(10, "Décrivez la situation initiale"),
  after: z.string().trim().min(10, "Décrivez le résultat"),
  resultMetric: z.string().trim().max(200).optional().or(z.literal("")),
  imagePaths: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});
export type CaseStudyInput = z.infer<typeof caseStudySchema>;
