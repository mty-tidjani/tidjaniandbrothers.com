import { z } from "zod";

// --- Public API (/api/sms/v1) -----------------------------------------------

export const MAX_RECIPIENTS_PER_REQUEST = 300;

export const sendSmsSchema = z.object({
  to: z
    .union([z.string(), z.array(z.string())])
    .transform((value) =>
      (Array.isArray(value) ? value : value.split(","))
        .map((n) => n.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string())
        .min(1, "At least one recipient is required")
        .max(
          MAX_RECIPIENTS_PER_REQUEST,
          `At most ${MAX_RECIPIENTS_PER_REQUEST} recipients per request`,
        ),
    ),
  message: z.string().min(1, "Message is required").max(2000),
  encoding: z.enum(["auto", "gsm7", "unicode"]).default("auto"),
});
export type SendSmsInput = z.infer<typeof sendSmsSchema>;

/**
 * 1s2u wants international numbers without "+" or "00". We accept those
 * prefixes plus common separators from customers and strip them, then
 * require 8–15 digits (E.164 length) not starting with 0.
 */
export function normalizeRecipient(raw: string): string | null {
  const digits = raw.replace(/[\s\-.()]/g, "").replace(/^(\+|00)/, "");
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

// --- Sender IDs -------------------------------------------------------------

/**
 * 1s2u rules: numeric-only senders up to 15 digits (optionally with a
 * leading "+"), alphanumeric senders up to 11 characters. We also keep the
 * alphanumeric charset conservative, since SMSCs reject exotic characters.
 */
export const senderIdValueSchema = z
  .string()
  .trim()
  .refine(
    (v) =>
      /^\+?\d{3,15}$/.test(v) ||
      (/^[A-Za-z0-9 .&-]{3,11}$/.test(v) && /[A-Za-z]/.test(v)),
    "Nom d'expéditeur invalide : 3 à 11 caractères alphanumériques (lettres, chiffres, espace, . & -), ou 3 à 15 chiffres",
  );

export const senderIdCreateSchema = z.object({
  accountId: z.string().min(1),
  value: senderIdValueSchema,
});

export const senderIdActionSchema = z
  .object({
    senderIdId: z.string().min(1),
    action: z.enum(["approve", "reject", "block", "unblock"]),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((v) => !["reject", "block"].includes(v.action) || !!v.reason, {
    message: "Un motif est requis pour rejeter ou bloquer",
    path: ["reason"],
  });

// --- Accounts ---------------------------------------------------------------

export const smsAccountCreateSchema = z.object({
  companyName: z.string().trim().min(2, "Nom de l'entreprise requis"),
  contactName: z.string().trim().min(2, "Nom du contact requis"),
  contactEmail: z.email("Email invalide"),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s]{7,18}$/, "Numéro invalide"),
  notes: z.string().trim().max(2000).optional(),
});

export const SMS_ACCOUNT_STATUSES = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "DISABLED",
] as const;

export const smsAccountStatusSchema = z
  .object({
    accountId: z.string().min(1),
    status: z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.status === "ACTIVE" || !!v.reason, {
    message: "Un motif est requis pour suspendre ou désactiver",
    path: ["reason"],
  });

export const smsTopupSchema = z.object({
  accountId: z.string().min(1),
  packageId: z.string().optional(),
  credits: z.coerce.number().int().positive("Crédits invalides"),
  amountFcfa: z.coerce.number().int().min(0, "Montant invalide"),
  note: z.string().trim().max(500).optional(),
});

export const smsAdjustmentSchema = z.object({
  accountId: z.string().min(1),
  credits: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, "Indiquez un nombre de crédits non nul"),
  note: z.string().trim().min(3, "Un motif est requis").max(500),
});

// --- API keys ---------------------------------------------------------------

export const apiKeyIssueSchema = z.object({
  senderIdId: z.string().min(1, "Choisissez un nom d'expéditeur"),
  label: z.string().trim().min(2, "Libellé requis").max(60),
});

// --- Pricing ----------------------------------------------------------------

export const rateCardSchema = z.object({
  id: z.string().optional(),
  prefix: z
    .string()
    .trim()
    .regex(/^[1-9]\d{0,5}$/, "Préfixe invalide (chiffres)"),
  label: z.string().trim().min(2, "Libellé requis"),
  upstreamCostFcfa: z.coerce.number().int().positive("Coût invalide"),
  creditsPerPart: z.coerce.number().int().positive("Crédits invalides"),
  active: z.boolean(),
});

export const smsPackageSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Nom requis"),
  credits: z.coerce.number().int().positive("Crédits invalides"),
  priceFcfa: z.coerce.number().int().positive("Prix invalide"),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean(),
});
