import Link from "next/link";
import { Download, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SmsBadge } from "@/components/admin/sms/SmsBadge";
import { smsSecondaryButton } from "@/components/admin/sms/buttons";
import { PageHeader } from "@/components/sms-portal/PageHeader";
import { Pagination, parsePage } from "@/components/sms-portal/Pagination";
import { SMS_MESSAGE_STATUS_LABELS } from "@/lib/constants";
import { getPortalMessages } from "@/lib/data/sms-portal";
import { formatDateTime } from "@/lib/format";
import { requirePortalSession } from "@/lib/sms-portal/session";

export const metadata = { title: "Historique" };

type PageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
};

export default async function SmsHistoryPage({ searchParams }: PageProps) {
  const { account } = await requirePortalSession();
  const { status, q, from, to, page: rawPage } = await searchParams;
  const filters = { status, q, from, to };
  const page = parsePage(rawPage);
  const { items, total, pages } = await getPortalMessages(
    account.id,
    filters,
    page,
  );

  const exportQuery = new URLSearchParams(
    Object.entries(filters).filter((e): e is [string, string] => !!e[1]),
  ).toString();

  return (
    <>
      <PageHeader
        title="Historique des envois"
        description={`${new Intl.NumberFormat("fr-FR").format(total)} envoi${total > 1 ? "s" : ""}`}
        actions={
          <a
            href={`/sms/historique/export${exportQuery ? `?${exportQuery}` : ""}`}
            className={smsSecondaryButton}
          >
            <Download className="mr-2 inline h-4 w-4" aria-hidden="true" />
            Exporter (CSV)
          </a>
        }
      />

      <GlassCard hover={false} className="p-4">
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant text-xs">Numéro</span>
            <div className="relative">
              <Search
                className="text-on-surface-variant pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="237670000000"
                className="py-2 pl-9"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant text-xs">Statut</span>
            <Select name="status" defaultValue={status ?? ""} className="py-2">
              <option value="">Tous</option>
              {Object.entries(SMS_MESSAGE_STATUS_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </Select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant text-xs">Du</span>
            <Input
              type="date"
              name="from"
              defaultValue={from}
              className="py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant text-xs">Au</span>
            <Input type="date" name="to" defaultValue={to} className="py-2" />
          </label>
          <button type="submit" className={smsSecondaryButton}>
            Filtrer
          </button>
        </form>
      </GlassCard>

      <GlassCard hover={false} className="p-0">
        {items.length === 0 ? (
          <p className="text-on-surface-variant p-6 text-center">
            Aucun envoi ne correspond.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-glass-stroke/50 text-label-caps text-on-surface-variant border-b uppercase">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Expéditeur</th>
                  <th className="px-4 py-3">Destinataires</th>
                  <th className="px-4 py-3 text-right">Crédits</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr
                    key={m.id}
                    className="group border-glass-stroke/30 hover:bg-surface-variant/10 border-b last:border-0"
                  >
                    <td className="text-on-surface-variant px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/sms/historique/${m.id}`}
                        className="group-hover:text-primary"
                      >
                        {formatDateTime(m.createdAt)}
                      </Link>
                    </td>
                    <td className="text-on-surface max-w-xs truncate px-4 py-3">
                      <Link href={`/sms/historique/${m.id}`}>{m.body}</Link>
                    </td>
                    <td className="text-on-surface-variant px-4 py-3">
                      {m.senderValue}
                    </td>
                    <td className="text-on-surface-variant px-4 py-3 font-mono">
                      {m.recipients.length === 1
                        ? m.recipients[0]
                        : `${m.recipients.length} numéros`}
                    </td>
                    <td className="text-on-surface px-4 py-3 text-right tabular-nums">
                      {m.creditsCharged - m.creditsRefunded}
                    </td>
                    <td className="px-4 py-3">
                      <SmsBadge kind="message" status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <Pagination
        page={page}
        pages={pages}
        basePath="/sms/historique"
        params={filters}
      />
    </>
  );
}
