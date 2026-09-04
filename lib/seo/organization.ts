import type {
  LocalBusiness,
  OrganizationLeaf,
  WithContext,
} from "schema-dts";
import { SITE_URL } from "@/lib/constants";

// Plain (no `@context`) reference for nesting inside other JSON-LD blocks
// (Service.provider, BlogPosting.publisher) — only the top-level object in
// a <script> tag should carry `@context`. Typed as the concrete
// `OrganizationLeaf` (not the broader `Organization` union, which includes a
// bare `string` ID-reference variant) so it stays spreadable.
const LOGO_URL = `${SITE_URL}/brand/logo.png`;

export const ORGANIZATION_REF: OrganizationLeaf = {
  "@type": "Organization",
  name: "Tidjani & Brothers",
  url: SITE_URL,
  logo: LOGO_URL,
};

type CompanySettings = {
  phone: string;
  email: string;
  address: string;
};

export function getOrganizationJsonLd(
  settings: CompanySettings,
): WithContext<LocalBusiness> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Tidjani & Brothers",
    url: SITE_URL,
    image: LOGO_URL,
    logo: LOGO_URL,
    description:
      "Tidjani & Brothers accompagne les PME camerounaises dans leur transition vers Odoo ERP : installation, support et intégration mobile money.",
    telephone: settings.phone,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Yaoundé",
      addressCountry: "CM",
    },
    // No `sameAs`: the social link in the DB is a placeholder
    // (facebook.com root, not a real business page) — omit rather than
    // feed inaccurate data to search engines / AI agents.
  };
}
