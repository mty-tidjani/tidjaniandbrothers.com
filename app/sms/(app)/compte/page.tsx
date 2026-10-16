import { GlassCard } from "@/components/ui/GlassCard";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { ActionForm } from "@/components/admin/sms/ActionForm";
import { SmsBadge } from "@/components/admin/sms/SmsBadge";
import {
  smsPrimaryButton,
  smsSecondaryButton,
} from "@/components/admin/sms/buttons";
import { PageHeader } from "@/components/sms-portal/PageHeader";
import {
  changePortalPassword,
  updatePortalProfile,
} from "@/lib/actions/sms-portal";
import { formatDate } from "@/lib/format";
import { requirePortalSession } from "@/lib/sms-portal/session";

export const metadata = { title: "Mon compte" };

export default async function SmsAccountPage() {
  const { user, account } = await requirePortalSession();

  return (
    <>
      <PageHeader title="Mon compte" />

      <div className="gap-gutter grid grid-cols-1 lg:grid-cols-2">
        <GlassCard hover={false} className="p-6">
          <h2 className="text-headline-sm text-on-surface mb-4">Entreprise</h2>
          <dl className="mb-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Entreprise</dt>
              <dd className="text-on-surface text-right font-medium">
                {account.companyName}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Email de connexion</dt>
              <dd className="text-on-surface text-right font-medium">
                {user.email}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-on-surface-variant">Statut</dt>
              <dd>
                <SmsBadge kind="account" status={account.status} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Client depuis</dt>
              <dd className="text-on-surface text-right font-medium">
                {formatDate(account.createdAt)}
              </dd>
            </div>
          </dl>
          <p className="text-on-surface-variant mb-4 text-sm">
            Pour changer le nom de l&rsquo;entreprise ou l&rsquo;email,
            contactez-nous.
          </p>

          <h3 className="text-label-caps text-on-surface mb-3 uppercase">
            Contact
          </h3>
          <ActionForm
            action={updatePortalProfile}
            className="flex flex-col gap-4"
          >
            <FormField label="Votre nom" htmlFor="name">
              <Input id="name" name="name" defaultValue={user.name} required />
            </FormField>
            <FormField label="Téléphone" htmlFor="contactPhone">
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                defaultValue={account.contactPhone}
                required
              />
            </FormField>
            <div>
              <button type="submit" className={smsSecondaryButton}>
                Enregistrer
              </button>
            </div>
          </ActionForm>
        </GlassCard>

        <GlassCard hover={false} className="p-6">
          <h2 className="text-headline-sm text-on-surface mb-4">
            Mot de passe
          </h2>
          <ActionForm
            action={changePortalPassword}
            className="flex flex-col gap-4"
          >
            <FormField label="Mot de passe actuel" htmlFor="currentPassword">
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </FormField>
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
            <div>
              <button type="submit" className={smsPrimaryButton}>
                Changer le mot de passe
              </button>
            </div>
          </ActionForm>
        </GlassCard>
      </div>
    </>
  );
}
