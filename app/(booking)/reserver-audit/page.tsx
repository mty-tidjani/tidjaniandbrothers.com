import type { Metadata } from "next";
import { AuditBookingForm } from "@/components/forms/AuditBookingForm";

export const metadata: Metadata = {
  title: "Réserver votre audit gratuit",
  description:
    "Réservez votre audit gratuit Odoo ERP en deux étapes rapides. Un membre de l'équipe Spartiat-AI vous recontacte sous 24h ouvrées.",
};

export default function ReserverAuditPage() {
  return <AuditBookingForm />;
}
