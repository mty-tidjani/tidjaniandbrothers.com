import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lien envoyé",
  robots: { index: false },
};

export default function ForgotPasswordSentPage() {
  return (
    <main className="dark bg-deep-black px-margin-mobile relative flex min-h-screen items-center justify-center">
      <div className="ambient-mesh" aria-hidden="true" />
      <div className="w-full max-w-md text-center">
        <div className="glass-card rounded-xl p-8 md:p-10">
          <MailCheck
            className="text-primary mx-auto mb-4 h-10 w-10"
            aria-hidden="true"
          />
          <h1 className="text-headline-sm text-on-surface mb-2">
            Si ce compte existe, un email a été envoyé
          </h1>
          <p className="mb-stack-md text-on-surface-variant">
            Vérifiez votre boîte de réception pour le lien de réinitialisation.
          </p>
          <Link href="/admin/login" className="text-primary hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </main>
  );
}
