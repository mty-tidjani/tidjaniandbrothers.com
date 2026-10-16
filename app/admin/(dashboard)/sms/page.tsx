import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Users, Wallet, TrendingUp, Coins } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatWidget } from "@/components/admin/StatWidget";
import { ActionForm } from "@/components/admin/sms/ActionForm";
import { SmsBadge } from "@/components/admin/sms/SmsBadge";
import { SmsSubNav } from "@/components/admin/sms/SmsSubNav";
import {
  smsPrimaryButton,
  smsSecondaryButton,
} from "@/components/admin/sms/buttons";
import { auth } from "@/lib/auth";
import { SMS_ACCOUNT_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatFcfa } from "@/lib/format";
import { getSmsAccounts, getSmsOverview } from "@/lib/data/sms";
import { createSmsAccount } from "@/lib/actions/sms-accounts";
import { SMS_ACCOUNT_STATUSES } from "@/lib/validation/sms";

export const metadata: Metadata = {
  title: "SMS — Comptes clients",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminSmsAccountsPage({
  searchParams,
}: PageProps) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const { status, q } = await searchParams;
  const [accounts, overview] = await Promise.all([
    getSmsAccounts({ status, search: q }),
    getSmsOverview(),
  ]);
  const marginPct =
    overview.revenueFcfa > 0
      ? (overview.grossProfitFcfa / overview.revenueFcfa) * 100
      : null;

  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">SMS API</h1>
        <p className="text-on-surface-variant mt-1">
          Revente de SMS via 1s2u : comptes clients, noms d&rsquo;expéditeur,
          clés API et crédits.
        </p>
      </header>

      <SmsSubNav active="/admin/sms" />

      <div className="gap-stack-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget
          label="Comptes actifs"
          value={String(overview.activeAccounts)}
          icon={Users}
          hint={`Sur ${overview.totalAccounts} comptes`}
        />
        <StatWidget
          label="Ventes encaissées"
          value={formatFcfa(overview.revenueFcfa)}
          icon={Wallet}
          hint="Total des recharges"
        />
        <StatWidget
          label="Marge brute"
          value={formatFcfa(overview.grossProfitFcfa)}
          icon={TrendingUp}
          hint={
            marginPct === null
              ? "Après coût 1s2u"
              : `${marginPct.toFixed(0)}% après coût 1s2u`
          }
        />
        <StatWidget
          label="Crédits en circulation"
          value={new Intl.NumberFormat("fr-FR").format(
            overview.outstandingCredits,
          )}
          icon={Coins}
          hint={`${overview.creditsUsedLast30Days} utilisés sur 30 j`}
        />
      </div>

      {overview.pendingSenders > 0 ? (
        <Link
          href="/admin/sms/senders?status=PENDING_REVIEW"
          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-400 hover:underline"
        >
          {overview.pendingSenders} nom(s) d&rsquo;expéditeur à valider →
        </Link>
      ) : null}

      <GlassCard hover={false} className="p-4">
        <form className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-1/3">
            <Search
              className="text-on-surface-variant pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Rechercher entreprise, contact, email..."
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              name="status"
              defaultValue={status ?? ""}
              className="min-w-[160px]"
            >
              <option value="">Tous les statuts</option>
              {SMS_ACCOUNT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {SMS_ACCOUNT_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
            <button type="submit" className={smsSecondaryButton}>
              Filtrer
            </button>
          </div>
        </form>
      </GlassCard>

      <GlassCard hover={false} className="p-0">
        {accounts.length === 0 ? (
          <p className="text-on-surface-variant p-6 text-center">
            Aucun compte SMS pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-glass-stroke/50 text-label-caps text-on-surface-variant border-b uppercase">
                  <th className="px-4 py-3">Entreprise</th>
                  <th className="px-4 py-3">Expéditeurs</th>
                  <th className="px-4 py-3">Clés actives</th>
                  <th className="px-4 py-3">Crédits</th>
                  <th className="px-4 py-3">Créé le</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="group border-glass-stroke/30 hover:bg-surface-variant/10 border-b transition-colors last:border-0"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/sms/${account.id}`}
                        className="text-on-surface group-hover:text-primary font-medium"
                      >
                        {account.companyName}
                      </Link>
                      <p className="text-on-surface-variant text-sm">
                        {account.contactEmail}
                      </p>
                    </td>
                    <td className="text-on-surface-variant px-4 py-4 text-sm">
                      {account.senderIds.length === 0
                        ? "—"
                        : account.senderIds
                            .map(
                              (s) =>
                                `${s.value}${s.status === "BLOCKED" ? " ⛔" : ""}`,
                            )
                            .join(", ")}
                    </td>
                    <td className="text-on-surface-variant px-4 py-4">
                      {account._count.apiKeys}
                    </td>
                    <td className="text-on-surface px-4 py-4 font-medium">
                      {account.creditBalance}
                    </td>
                    <td className="text-on-surface-variant px-4 py-4">
                      {formatDate(account.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <SmsBadge kind="account" status={account.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <GlassCard hover={false} className="p-6">
        <h2 className="text-headline-sm text-on-surface mb-4">
          Nouveau compte client
        </h2>
        <ActionForm
          action={createSmsAccount}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <FormField label="Entreprise" htmlFor="companyName">
            <Input id="companyName" name="companyName" required />
          </FormField>
          <FormField label="Nom du contact" htmlFor="contactName">
            <Input id="contactName" name="contactName" required />
          </FormField>
          <FormField label="Email" htmlFor="contactEmail">
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
            />
          </FormField>
          <FormField label="Téléphone" htmlFor="contactPhone">
            <Input
              id="contactPhone"
              name="contactPhone"
              placeholder="+237 6XX XXX XXX"
              required
            />
          </FormField>
          <FormField
            label="Notes internes"
            htmlFor="notes"
            className="md:col-span-2"
          >
            <Textarea id="notes" name="notes" rows={2} />
          </FormField>
          <div className="md:col-span-2">
            <button type="submit" className={smsPrimaryButton}>
              Créer le compte
            </button>
            <p className="text-on-surface-variant mt-2 text-sm">
              Le compte est créé « En attente » : activez-le après avoir validé
              un nom d&rsquo;expéditeur et enregistré un paiement.
            </p>
          </div>
        </ActionForm>
      </GlassCard>
    </div>
  );
}
