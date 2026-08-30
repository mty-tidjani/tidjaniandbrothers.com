import { z } from "zod";

export const serviceTierSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Le nom de la formule est requis"),
  priceMin: z.coerce.number().int().nonnegative(),
  priceMax: z.coerce.number().int().nonnegative().optional().nullable(),
  currency: z.string().default("FCFA"),
  features: z.array(z.string().trim().min(1)).default([]),
  maxUsers: z.string().trim().optional().or(z.literal("")),
  isMaintenance: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});
export type ServiceTierInput = z.infer<typeof serviceTierSchema>;

export const serviceTiersFormSchema = z.object({
  tiers: z.array(serviceTierSchema),
});
