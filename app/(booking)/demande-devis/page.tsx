import type { Metadata } from "next";
import { DevisForm } from "@/components/forms/devis/DevisForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Demander un devis",
  description:
    "Obtenez un devis détaillé pour votre projet Odoo ERP en répondant à quelques questions sur votre entreprise et vos besoins.",
  path: "/demande-devis",
});

export default function DemandeDevisPage() {
  return <DevisForm />;
}
