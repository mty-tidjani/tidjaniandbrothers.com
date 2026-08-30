export const SECTORS = [
  { value: "commerce", label: "Commerce / Retail" },
  { value: "distribution", label: "Distribution" },
  { value: "services", label: "Services professionnels" },
  { value: "sante", label: "Santé" },
  { value: "autre", label: "Autre" },
] as const;

export type SectorValue = (typeof SECTORS)[number]["value"];

export const AUDIT_SERVICES = [
  {
    value: "odoo_installation",
    label: "Installation Odoo",
    description: "Déploiement ERP complet",
  },
  {
    value: "odoo_support",
    label: "Support / Maintenance Odoo existant",
    description: "Optimisation et assistance continue",
  },
  {
    value: "web",
    label: "Site web",
    description: "Vitrine, e-commerce ou portfolio",
  },
  {
    value: "unsure",
    label: "Je ne sais pas encore",
    description: "Un audit nous aidera à cadrer le besoin",
  },
] as const;

export const CONTACT_SERVICES = [
  { value: "odoo", label: "Intégration Odoo" },
  { value: "web", label: "Création site web" },
  { value: "both", label: "Les deux" },
] as const;

export const PREFERRED_SLOTS = [
  { value: "cette_semaine", label: "Cette semaine" },
  { value: "semaine_prochaine", label: "Semaine prochaine" },
  { value: "flexible", label: "Flexible" },
] as const;

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau",
  CONTACTE: "Contacté",
  AUDIT_PLANIFIE: "Audit planifié",
  CONVERTI: "Converti",
  PERDU: "Perdu",
};

export const LEAD_STATUS_ORDER = [
  "NOUVEAU",
  "CONTACTE",
  "AUDIT_PLANIFIE",
  "CONVERTI",
  "PERDU",
] as const;

// Tailwind class fragments keyed by status, consumed by <StatusBadge>.
export const LEAD_STATUS_STYLES: Record<string, string> = {
  NOUVEAU: "bg-primary-container/10 text-primary border-primary/30",
  CONTACTE: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  AUDIT_PLANIFIE: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  CONVERTI: "bg-green-500/10 text-green-400 border-green-500/30",
  PERDU: "bg-surface-variant text-on-surface-variant border-outline-variant",
};

export const BLOG_CATEGORY_LABELS: Record<string, string> = {
  ODOO: "Odoo",
  DIGITALISATION: "Digitalisation",
  ACTUALITES: "Actualités entreprise",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin (accès complet)",
  EDITOR: "Éditeur (blog / portfolio)",
};

export const COMPANY_PHONE = "+237 6 98 96 67 19";
export const COMPANY_PHONE_TEL = "tel:+237698966719";
export const COMPANY_EMAIL = "contact@spartiat-it.com";
export const COMPANY_EMAIL_MAILTO = "mailto:contact@spartiat-it.com";
export const COMPANY_ADDRESS =
  "Awaye — près du Collège Père Monti, Yaoundé, Cameroun";
export const COMPANY_FACEBOOK_URL = "https://www.facebook.com";

export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/services/odoo", label: "Services Odoo" },
  { href: "/services/web-design", label: "Web Design" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "À propos" },
] as const;

type AdminNavLink = {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
};

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: "/admin", label: "Tableau de bord", icon: "dashboard" },
  { href: "/admin/leads", label: "Demandes", icon: "leaderboard" },
  { href: "/admin/blog", label: "Blog", icon: "edit_note" },
  { href: "/admin/portfolio", label: "Portfolio", icon: "business_center" },
  {
    href: "/admin/services",
    label: "Services & Tarifs",
    icon: "extension",
    adminOnly: true,
  },
  { href: "/admin/team", label: "Équipe", icon: "group", adminOnly: true },
  { href: "/admin/settings", label: "Paramètres", icon: "settings" },
];
