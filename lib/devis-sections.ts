import { SECTORS } from "@/lib/constants";

const CODE_LABELS: Record<string, string> = {
  oui: "Oui",
  non: "Non",
  excel: "Excel",
  papier: "Papier",
  autre_logiciel: "Autre logiciel",
  autre: "Autre",
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  a_l_aise: "À l'aise",
  sur_site: "Sur site",
  a_distance: "À distance",
  les_deux: "Les deux",
  cette_semaine: "Cette semaine",
  ce_mois: "Ce mois",
  flexible: "Flexible",
  facturation: "Facturation",
  gestion_stock: "Gestion de stock",
  ventes_crm: "Ventes / CRM",
  comptabilite: "Comptabilité complète",
  point_de_vente: "Point de vente",
  rh_paie: "RH / Paie",
  production: "Production",
  multi_entrepot: "Multi-entrepôt",
  ordinateurs: "Ordinateurs",
  imprimante_recus: "Imprimante à reçus",
  lecteur_code_barres: "Lecteur code-barres",
};

function label(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) {
    return value.length > 0
      ? value.map((v) => CODE_LABELS[String(v)] ?? String(v)).join(", ")
      : "—";
  }
  return CODE_LABELS[String(value)] ?? String(value);
}

function sectorLabel(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  return SECTORS.find((s) => s.value === value)?.label ?? String(value);
}

export type DevisFieldMeta = {
  key: string;
  label: string;
  format?: (value: unknown) => string;
};

export type DevisSectionMeta = {
  key: string;
  title: string;
  fields: DevisFieldMeta[];
};

export const DEVIS_SECTIONS: DevisSectionMeta[] = [
  {
    key: "infosGenerales",
    title: "Informations générales",
    fields: [
      { key: "companyName", label: "Entreprise" },
      { key: "sector", label: "Secteur d'activité", format: sectorLabel },
      { key: "employeeCount", label: "Nombre d'employés" },
      { key: "siteCount", label: "Nombre de sites" },
      { key: "city", label: "Ville" },
    ],
  },
  {
    key: "situationActuelle",
    title: "Situation actuelle",
    fields: [
      { key: "currentManagement", label: "Gestion actuelle", format: label },
      { key: "currentManagementDetail", label: "Précisions" },
      { key: "mainProblem", label: "Problème principal" },
      { key: "hasUsedOdoo", label: "A déjà utilisé Odoo", format: label },
    ],
  },
  {
    key: "besoinsFonctionnels",
    title: "Besoins fonctionnels",
    fields: [
      { key: "features", label: "Modules souhaités", format: label },
      { key: "productCount", label: "Nombre de produits" },
    ],
  },
  {
    key: "utilisateurs",
    title: "Utilisateurs",
    fields: [
      { key: "dailyUserCount", label: "Utilisateurs quotidiens" },
      { key: "comfortLevel", label: "Confort numérique", format: label },
      { key: "trainingNeed", label: "Besoin de formation", format: label },
    ],
  },
  {
    key: "donneesAMigrer",
    title: "Données à migrer",
    fields: [
      { key: "hasExistingData", label: "Données existantes", format: label },
      { key: "dataFormat", label: "Format des données", format: label },
      { key: "approximateVolume", label: "Volume approximatif" },
    ],
  },
  {
    key: "integrations",
    title: "Intégrations",
    fields: [
      { key: "wantsMobileMoney", label: "Mobile Money souhaité", format: label },
      {
        key: "hasEcommerceSite",
        label: "Site e-commerce existant",
        format: label,
      },
      { key: "ecommerceUrl", label: "URL du site" },
      { key: "otherSoftware", label: "Autres logiciels" },
    ],
  },
  {
    key: "infrastructure",
    title: "Infrastructure",
    fields: [
      {
        key: "hasStableInternet",
        label: "Connexion internet stable",
        format: label,
      },
      { key: "availableHardware", label: "Matériel disponible", format: label },
    ],
  },
  {
    key: "delaiBudget",
    title: "Délai et budget",
    fields: [
      { key: "desiredTimeline", label: "Délai souhaité", format: label },
      { key: "budget", label: "Budget" },
      {
        key: "interestedInWebsite",
        label: "Intéressé par un site web",
        format: label,
      },
    ],
  },
  {
    key: "contact",
    title: "Contact",
    fields: [
      { key: "contactName", label: "Nom du décisionnaire" },
      { key: "contactPhone", label: "Téléphone" },
      { key: "contactEmail", label: "Email" },
      { key: "bestContactTime", label: "Meilleur moment pour être recontacté" },
    ],
  },
];

export function getSectionEntries(
  section: DevisSectionMeta,
  data: Record<string, unknown> | undefined,
): { label: string; value: string }[] {
  return section.fields.map((field) => {
    const raw = data?.[field.key];
    const value = field.format ? field.format(raw) : label(raw);
    return { label: field.label, value };
  });
}
