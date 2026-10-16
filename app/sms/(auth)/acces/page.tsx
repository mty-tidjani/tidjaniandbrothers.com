import type { Metadata } from "next";
import Link from "next/link";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { ActionForm } from "@/components/admin/sms/ActionForm";
import { smsPrimaryButton } from "@/components/admin/sms/buttons";
import { AuthCard } from "@/components/sms-portal/AuthCard";
import { setPortalPassword } from "@/lib/actions/sms-portal-auth";

export const metadata: Metadata = {
  title: "Choisir un mot de passe — Espace SMS",
  robots: { index: false },
};

type PageProps = { searchParams: Promise<{ token?: string }> };

export default async function SmsAccessPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard
        title="Lien incomplet"
        subtitle="Ouvrez le lien complet que nous vous avons envoyé, ou demandez-en un nouveau."
      >
        <Link
          href="/sms/mot-de-passe-oublie"
          className="text-primary hover:underline"
        >
          Demander un nouveau lien
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choisissez votre mot de passe"
      subtitle="Ce lien n'est valable qu'une fois."
    >
      <ActionForm action={setPortalPassword} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <FormField
          label="Nouveau mot de passe (8 caractères min.)"
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
        <FormField label="Confirmer" htmlFor="confirmPassword">
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
          Enregistrer et me connecter
        </button>
      </ActionForm>
    </AuthCard>
  );
}
