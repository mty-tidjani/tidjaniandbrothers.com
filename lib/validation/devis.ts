import { z } from "zod";
import { phoneRegex } from "@/lib/validation/lead";

export const devisStep1Schema = z.object({
  companyName: z.string().trim().min(2, "Le nom de l'entreprise est requis"),
  sector: z.string().min(1, "Sélectionnez un secteur"),
  employeeCount: z.coerce.number().int().min(1, "Indiquez le nombre d'employés"),
  siteCount: z.coerce.number().int().min(1, "Indiquez le nombre de sites"),
  city: z.string().trim().min(2, "La ville est requise"),
});

export const devisStep2Schema = z.object({
  currentManagement: z.enum(["excel", "papier", "autre_logiciel", "autre"], {
    error: "Sélectionnez une option",
  }),
  currentManagementDetail: z.string().trim().max(500).optional().or(z.literal("")),
  mainProblem: z.string().trim().min(5, "Décrivez brièvement le problème principal"),
  hasUsedOdoo: z.enum(["oui", "non"], { error: "Sélectionnez une option" }),
});

export const DEVIS_FEATURE_VALUES = [
  "facturation",
  "gestion_stock",
  "ventes_crm",
  "comptabilite",
  "point_de_vente",
  "rh_paie",
  "production",
  "multi_entrepot",
] as const;

export const devisStep3Schema = z
  .object({
    features: z.array(z.enum(DEVIS_FEATURE_VALUES)).default([]),
    productCount: z.coerce.number().int().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.features.includes("gestion_stock") && !data.productCount) {
      ctx.addIssue({
        code: "custom",
        path: ["productCount"],
        message: "Indiquez le nombre de produits",
      });
    }
  });

export const devisStep4Schema = z.object({
  dailyUserCount: z.coerce.number().int().min(1, "Indiquez le nombre d'utilisateurs"),
  comfortLevel: z.enum(["debutant", "intermediaire", "a_l_aise"], {
    error: "Sélectionnez une option",
  }),
  trainingNeed: z.enum(["sur_site", "a_distance", "les_deux"], {
    error: "Sélectionnez une option",
  }),
});

export const devisStep5Schema = z
  .object({
    hasExistingData: z.enum(["oui", "non"], { error: "Sélectionnez une option" }),
    dataFormat: z.enum(["excel", "papier", "autre_logiciel"]).optional(),
    approximateVolume: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.hasExistingData === "oui" && !data.dataFormat) {
      ctx.addIssue({
        code: "custom",
        path: ["dataFormat"],
        message: "Sélectionnez le format de vos données",
      });
    }
  });

export const devisStep6Schema = z.object({
  wantsMobileMoney: z.enum(["oui", "non"], { error: "Sélectionnez une option" }),
  hasEcommerceSite: z.enum(["oui", "non"], { error: "Sélectionnez une option" }),
  ecommerceUrl: z.url("URL invalide").optional().or(z.literal("")),
  otherSoftware: z.string().trim().max(500).optional().or(z.literal("")),
});

export const DEVIS_HARDWARE_VALUES = [
  "ordinateurs",
  "imprimante_recus",
  "lecteur_code_barres",
  "autre",
] as const;

export const devisStep7Schema = z.object({
  hasStableInternet: z.enum(["oui", "non"], { error: "Sélectionnez une option" }),
  availableHardware: z.array(z.enum(DEVIS_HARDWARE_VALUES)).default([]),
});

export const devisStep8Schema = z.object({
  desiredTimeline: z.enum(["cette_semaine", "ce_mois", "flexible"], {
    error: "Sélectionnez un délai",
  }),
  budget: z.string().trim().max(200).optional().or(z.literal("")),
  interestedInWebsite: z.enum(["oui", "non"], { error: "Sélectionnez une option" }),
});

export const devisStep9Schema = z.object({
  contactName: z.string().trim().min(2, "Le nom du décisionnaire est requis"),
  contactPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro invalide, ex: +237 6XX XXX XXX"),
  contactEmail: z.email("Email invalide"),
  bestContactTime: z.string().trim().min(1, "Indiquez un moment pour être recontacté"),
});

export const DEVIS_STEP_SCHEMAS = [
  devisStep1Schema,
  devisStep2Schema,
  devisStep3Schema,
  devisStep4Schema,
  devisStep5Schema,
  devisStep6Schema,
  devisStep7Schema,
  devisStep8Schema,
  devisStep9Schema,
] as const;

export const DEVIS_STEP_SECTION_KEYS = [
  "infosGenerales",
  "situationActuelle",
  "besoinsFonctionnels",
  "utilisateurs",
  "donneesAMigrer",
  "integrations",
  "infrastructure",
  "delaiBudget",
  "contact",
] as const;

export const devisFullSchema = devisStep1Schema
  .extend(devisStep2Schema.shape)
  .extend(devisStep3Schema.shape)
  .extend(devisStep4Schema.shape)
  .extend(devisStep5Schema.shape)
  .extend(devisStep6Schema.shape)
  .extend(devisStep7Schema.shape)
  .extend(devisStep8Schema.shape)
  .extend(devisStep9Schema.shape);

export type DevisFullInput = z.infer<typeof devisFullSchema>;

export const devisStatusUpdateSchema = z.object({
  devisId: z.string().min(1),
  status: z.enum(["BROUILLON", "SOUMIS", "DEVIS_ENVOYE", "CONVERTI", "PERDU"]),
});

export const devisAdminDetailsSchema = z.object({
  devisId: z.string().min(1),
  proposedAmount: z.coerce.number().int().nonnegative().optional(),
  internalNote: z.string().trim().max(4000).optional().or(z.literal("")),
});
