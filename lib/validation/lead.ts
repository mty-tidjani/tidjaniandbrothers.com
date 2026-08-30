import { z } from "zod";

// Cameroonian mobile numbers: optionally prefixed +237, then 9 digits starting 6.
const phoneRegex = /^(\+?237)?6\d{8}$/;

export const auditStep1Schema = z.object({
  fullName: z.string().trim().min(2, "Le nom complet est requis"),
  company: z.string().trim().min(2, "Le nom de l'entreprise est requis"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro invalide, ex: +237 6XX XXX XXX"),
  email: z.email("Email invalide"),
  sector: z.string().min(1, "Sélectionnez un secteur"),
});

export const auditStep2Schema = z.object({
  servicesWanted: z
    .array(z.string())
    .min(1, "Sélectionnez au moins un service"),
  preferredSlot: z.string().min(1, "Sélectionnez un créneau"),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const auditBookingSchema = auditStep1Schema.extend(
  auditStep2Schema.shape,
);
export type AuditBookingInput = z.infer<typeof auditBookingSchema>;

export const contactFormSchema = z.object({
  fullName: z.string().trim().min(2, "Le nom complet est requis"),
  company: z.string().trim().min(1, "Le nom de l'entreprise est requis"),
  phone: z.string().trim().regex(phoneRegex, "Numéro invalide"),
  email: z.email("Email invalide"),
  service: z.enum(["odoo", "web", "both"]),
  message: z.string().trim().min(10, "Décrivez brièvement votre besoin"),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const leadStatusUpdateSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum([
    "NOUVEAU",
    "CONTACTE",
    "AUDIT_PLANIFIE",
    "CONVERTI",
    "PERDU",
  ]),
});

export const leadNoteSchema = z.object({
  leadId: z.string().min(1),
  body: z.string().trim().min(1, "La note ne peut pas être vide"),
});
