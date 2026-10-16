import { z } from "zod";
import { senderIdValueSchema } from "@/lib/validation/sms";

const email = z.string().trim().toLowerCase().pipe(z.email("Email invalide"));

const newPassword = z.string().min(8, "Au moins 8 caractères").max(200);

export const portalRegisterSchema = z
  .object({
    companyName: z.string().trim().min(2, "Nom de l'entreprise requis"),
    name: z.string().trim().min(2, "Votre nom est requis"),
    email,
    phone: z
      .string()
      .trim()
      .regex(/^\+?\d[\d\s]{7,18}$/, "Numéro invalide"),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const portalLoginSchema = z.object({
  email,
  password: z.string().min(1, "Mot de passe requis"),
});

export const portalSetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const portalChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const portalProfileSchema = z.object({
  name: z.string().trim().min(2, "Votre nom est requis"),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s]{7,18}$/, "Numéro invalide"),
});

export const portalSenderRequestSchema = z.object({
  value: senderIdValueSchema,
});

export const portalApiKeySchema = z.object({
  senderIdId: z.string().min(1, "Choisissez un nom d'expéditeur"),
  label: z.string().trim().min(2, "Libellé requis").max(60),
});

/**
 * Recipients typed into the web form: one per line, or separated by commas
 * or semicolons. Spaces are kept inside a number ("+237 6 70 ...").
 */
export function splitRecipients(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((n) => n.trim())
    .filter(Boolean);
}
