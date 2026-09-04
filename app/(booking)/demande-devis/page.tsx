import type { Metadata } from "next";
import { DevisForm } from "@/components/forms/devis/DevisForm";

export const metadata: Metadata = {
  title: "Demander un devis",
  description:
    "Obtenez un devis détaillé pour votre projet Odoo ERP en répondant à quelques questions sur votre entreprise et vos besoins.",
};

export default function DemandeDevisPage() {
  return <DevisForm />;
}
