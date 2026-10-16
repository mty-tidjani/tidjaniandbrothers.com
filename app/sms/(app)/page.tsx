import Link from "next/link";
import {
  Wallet,
  Send,
  CheckCircle2,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatWidget } from "@/components/admin/StatWidget";
import { SmsBadge } from "@/components/admin/sms/SmsBadge";
import {
  smsPrimaryButton,
  smsSecondaryButton,
} from "@/components/admin/sms/buttons";
import { PageHeader } from "@/components/sms-portal/PageHeader";
import { UsageChart } from "@/components/sms-portal/UsageChart";
import { getPortalOverview } from "@/lib/data/sms-portal";
import { formatDateTime } from "@/lib/format";
import { requirePortalSession } from "@/lib/sms-portal/session";

export const metadata = { title: "Tableau de bord" };

export default async function SmsDashboardPage() {
  const { user, account } = await requirePortalSession();
  const overview = await getPortalOverview(account.id);
  const fmt = new Intl.NumberFormat("fr-FR");

  return (
    <>
      <PageHeader
        title={`Bonjour ${user.name.split(" ")[0]}`}
        description={account.companyName}
        actions={
          account.status === "ACTIVE" ? (
            <Link href="/sms/envoyer" className={smsPrimaryButton}>
              <Send className="mr-2 inline h-4 w-4" aria-hidden="true" />
              Envoyer un SMS
            </Link>
          ) : null
        }
      />

      <div className="gap-stack-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget
          label="Crédits disponibles"
          value={fmt.format(account.creditBalance)}
          icon={Wallet}
          hint="1 crédit = 1 SMS au Cameroun"
        />
        <StatWidget
          label="Envois (30 jours)"
          value={fmt.format(overview.messages)}
          icon={Send}
          hint={`${fmt.format(overview.creditsUsed)} crédits utilisés`}
        />
        <StatWidget
          label="Taux de réussite"
          value={
            overview.successRate === null
              ? "—"
              : `${overview.successRate.toFixed(0)}%`
          }
          icon={CheckCircle2}
          hint="Acceptés par l'opérateur, 30 j"
        />
        <StatWidget
          label="Expéditeurs approuvés"
          value={String(overview.approvedSenders)}
          icon={BadgeCheck}
          hint={
            overview.pendingSenders > 0
              ? `${overview.pendingSenders} en attente de validation`
              : "Noms affichés sur les téléphones"
          }
        />
      </div>

      {overview.approvedSenders === 0 ? (
        <GlassCard
          hover={false}
          className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-headline-sm text-on-surface">Pour commencer</h2>
            <p className="text-on-surface-variant mt-1 text-sm">
              Demandez votre nom d&rsquo;expéditeur : c&rsquo;est le nom qui
              s&rsquo;affiche à la place d&rsquo;un numéro sur le téléphone de
              vos clients.
            </p>
          </div>
          <Link href="/sms/expediteurs" className={smsSecondaryButton}>
            Demander un expéditeur
          </Link>
        </GlassCard>
      ) : null}

      <GlassCard hover={false} className="p-6">
        <h2 className="text-headline-sm text-on-surface mb-6">
          Crédits utilisés par jour
        </h2>
        <UsageChart data={overview.usage} />
      </GlassCard>

      <GlassCard hover={false} className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 className="text-headline-sm text-on-surface">Derniers envois</h2>
          <Link
            href="/sms/historique"
            className="text-primary flex items-center gap-1 text-sm whitespace-nowrap hover:underline"
          >
            Tout l&rsquo;historique
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {overview.recent.length === 0 ? (
          <p className="text-on-surface-variant">Aucun envoi pour le moment.</p>
        ) : (
          <ul className="divide-glass-stroke/40 divide-y">
            {overview.recent.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/sms/historique/${m.id}`}
                  className="hover:bg-surface-variant/10 flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="text-on-surface-variant w-40 shrink-0 text-sm">
                    {formatDateTime(m.createdAt)}
                  </span>
                  <span className="text-on-surface min-w-0 flex-1 truncate">
                    {m.body}
                  </span>
                  <span className="text-on-surface-variant shrink-0 text-sm">
                    {m.recipients.length} dest. ·{" "}
                    {m.creditsCharged - m.creditsRefunded} cr.
                  </span>
                  {/* Rows stack on mobile; keep the badge its natural width. */}
                  <span className="self-start sm:self-auto">
                    <SmsBadge kind="message" status={m.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </>
  );
}
