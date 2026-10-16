import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { AuthCard } from "@/components/sms-portal/AuthCard";
import {
  COMPANY_EMAIL,
  COMPANY_EMAIL_MAILTO,
  COMPANY_PHONE,
  COMPANY_PHONE_TEL,
  COMPANY_WHATSAPP_URL,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mot de passe oublié — Espace SMS",
  robots: { index: false },
};

// No email provider yet: resets go through support, who send a single-use
// link generated from the admin account page.
export default function SmsForgotPasswordPage() {
  const contactClass =
    "border-glass-stroke text-on-surface hover:border-primary flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors";
  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Contactez-nous avec l'email de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe."
    >
      <div className="flex flex-col gap-3">
        <a href={COMPANY_WHATSAPP_URL} className={contactClass}>
          <MessageCircle className="text-primary h-5 w-5" aria-hidden="true" />
          WhatsApp
        </a>
        <a href={COMPANY_PHONE_TEL} className={contactClass}>
          <Phone className="text-primary h-5 w-5" aria-hidden="true" />
          {COMPANY_PHONE}
        </a>
        <a href={COMPANY_EMAIL_MAILTO} className={contactClass}>
          <Mail className="text-primary h-5 w-5" aria-hidden="true" />
          {COMPANY_EMAIL}
        </a>
      </div>
      <p className="mt-6 text-center text-sm">
        <Link href="/sms/connexion" className="text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthCard>
  );
}
