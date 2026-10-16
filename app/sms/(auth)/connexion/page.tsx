import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { ActionForm } from "@/components/admin/sms/ActionForm";
import { smsPrimaryButton } from "@/components/admin/sms/buttons";
import { AuthCard } from "@/components/sms-portal/AuthCard";
import { loginPortal } from "@/lib/actions/sms-portal-auth";
import { getPortalSession } from "@/lib/sms-portal/session";

export const metadata: Metadata = {
  title: "Connexion — Espace SMS",
  robots: { index: false },
};

export default async function SmsLoginPage() {
  if (await getPortalSession()) redirect("/sms");

  return (
    <AuthCard
      title="Espace SMS"
      subtitle="Connectez-vous pour envoyer vos SMS et suivre votre crédit."
    >
      <ActionForm action={loginPortal} className="gap-stack-md flex flex-col">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </FormField>
        <FormField label="Mot de passe" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </FormField>
        <div className="flex justify-end">
          <Link
            href="/sms/mot-de-passe-oublie"
            className="text-on-surface-variant hover:text-primary text-sm hover:underline"
          >
            Mot de passe oublié&nbsp;?
          </Link>
        </div>
        <button type="submit" className={`${smsPrimaryButton} py-3`}>
          Se connecter
        </button>
      </ActionForm>
      <p className="text-on-surface-variant mt-6 text-center text-sm">
        Pas encore de compte&nbsp;?{" "}
        <Link href="/sms/inscription" className="text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthCard>
  );
}
