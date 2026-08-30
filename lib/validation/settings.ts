import { z } from "zod";

export const companySettingsSchema = z.object({
  phone: z.string().trim().min(6, "Téléphone requis"),
  email: z.email("Email invalide"),
  address: z.string().trim().min(5, "Adresse requise"),
  facebookUrl: z
    .url("URL invalide")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  defaultLocale: z.enum(["fr", "en"]),
});
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
