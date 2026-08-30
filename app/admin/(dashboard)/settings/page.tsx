import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { auth } from "@/lib/auth";
import { getCompanySettings } from "@/lib/data/settings";
import { updateCompanySettings } from "@/lib/actions/settings";

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const settings = await getCompanySettings();
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">Paramètres</h1>
        <p className="text-on-surface-variant mt-1">
          Ces informations sont synchronisées avec le pied de page et la page
          Contact du site public.
        </p>
      </header>

      {isAdmin ? (
        <GlassCard hover={false} className="p-6">
          <h2 className="text-headline-sm text-on-surface mb-4">
            Informations de l&rsquo;entreprise
          </h2>
          <form
            action={updateCompanySettings}
            className="gap-stack-md flex flex-col"
          >
            <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
              <FormField label="Téléphone" htmlFor="phone">
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={settings.phone}
                  required
                />
              </FormField>
              <FormField label="Email" htmlFor="email">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={settings.email}
                  required
                />
              </FormField>
            </div>
            <FormField label="Adresse" htmlFor="address">
              <Input
                id="address"
                name="address"
                defaultValue={settings.address}
                required
              />
            </FormField>
            <FormField label="Lien Facebook" htmlFor="facebookUrl">
              <Input
                id="facebookUrl"
                name="facebookUrl"
                type="url"
                defaultValue={settings.facebookUrl ?? ""}
                placeholder="https://facebook.com/..."
              />
            </FormField>
            <FormField
              label="Langue par défaut du site"
              htmlFor="defaultLocale"
            >
              <Select
                id="defaultLocale"
                name="defaultLocale"
                defaultValue={settings.defaultLocale}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </Select>
            </FormField>
            <div>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </GlassCard>
      ) : null}

      <GlassCard hover={false} className="p-6">
        <h2 className="text-headline-sm text-on-surface mb-4">Mon compte</h2>
        <ChangePasswordForm />
      </GlassCard>
    </div>
  );
}
