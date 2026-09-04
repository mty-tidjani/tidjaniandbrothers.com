import type { Metadata } from "next";
import { AuditBookingForm } from "@/components/forms/AuditBookingForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Réserver votre audit gratuit",
  description:
    "Réservez votre audit gratuit Odoo ERP en deux étapes rapides. Un membre de l'équipe Tidjani & Brothers vous recontacte sous 24h ouvrées.",
  path: "/reserver-audit",
});

export default function ReserverAuditPage() {
  return <AuditBookingForm />;
}
