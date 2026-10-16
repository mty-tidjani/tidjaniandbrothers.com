import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { ActionForm } from "@/components/admin/sms/ActionForm";
import { smsPrimaryButton } from "@/components/admin/sms/buttons";
import { AuthCard } from "@/components/sms-portal/AuthCard";
import { registerPortalAccount } from "@/lib/actions/sms-portal-auth";
import { getPublicSmsPackages } from "@/lib/data/sms-portal";
import { formatFcfa } from "@/lib/format";
import { getPortalSession } from "@/lib/sms-portal/session";

export const metadata: Metadata = {
  title: "Créer un compte SMS",
  description:
    "Envoyez des SMS professionnels au Cameroun avec votre propre nom d'expéditeur, depuis le web ou par API.",
};

const PERKS = [
  "Votre nom d'expéditeur (ex. MONSHOP)",
  "Envoi depuis le web ou via notre API",
  "Historique et suivi de vos crédits",
  "Crédits sans date d'expiration",
];

export default async function SmsRegisterPage() {
  if (await getPortalSession()) redirect("/sms");

  const packages = await getPublicSmsPackages();
  const cheapest = packages.length
    ? Math.min(...packages.map((p) => p.priceFcfa / p.credits))
    : null;

  return (
    <div className="gap-gutter grid w-full max-w-4xl grid-cols-1 items-start md:grid-cols-[1fr_28rem]">
      <section className="md:pt-8">
        <h2 className="text-headline-md text-on-surface">
          SMS professionnels au Cameroun
        </h2>
        {cheapest ? (
          <p className="text-on-surface-variant mt-2">
            À partir de{" "}
            <strong className="text-on-surface">
              {formatFcfa(Math.ceil(cheapest))}
            </strong>{" "}
            par SMS, vers MTN et Orange.
          </p>
        ) : null}
        <ul className="mt-6 space-y-3">
          {PERKS.map((perk) => (
            <li key={perk} className="text-on-surface flex items-center gap-3">
              <Check className="text-primary h-5 w-5" aria-hidden="true" />
              {perk}
            </li>
          ))}
        </ul>
        <p className="text-on-surface-variant mt-6 text-sm">
          Après l&rsquo;inscription, nous activons votre compte et le
          rechargeons dès réception de votre paiement (Mobile Money ou
          virement).
        </p>
      </section>

      <AuthCard title="Créer un compte" className="max-w-none">
        <ActionForm
          action={registerPortalAccount}
          className="flex flex-col gap-4"
        >
          <FormField label="Entreprise" htmlFor="companyName">
            <Input
              id="companyName"
              name="companyName"
              autoComplete="organization"
              required
            />
          </FormField>
          <FormField label="Votre nom" htmlFor="name">
            <Input id="name" name="name" autoComplete="name" required />
          </FormField>
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </FormField>
          <FormField label="Téléphone" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+237 6XX XXX XXX"
              required
            />
          </FormField>
          <FormField
            label="Mot de passe (8 caractères min.)"
            htmlFor="password"
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </FormField>
          <FormField
            label="Confirmer le mot de passe"
            htmlFor="confirmPassword"
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </FormField>
          <button type="submit" className={`${smsPrimaryButton} py-3`}>
            Créer mon compte
          </button>
        </ActionForm>
        <p className="text-on-surface-variant mt-6 text-center text-sm">
          Déjà inscrit&nbsp;?{" "}
          <Link href="/sms/connexion" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
