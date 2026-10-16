import { MessageCircle, Phone, Mail } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/sms-portal/PageHeader";
import { Pagination, parsePage } from "@/components/sms-portal/Pagination";
import {
  COMPANY_EMAIL,
  COMPANY_EMAIL_MAILTO,
  COMPANY_PHONE,
  COMPANY_PHONE_TEL,
  COMPANY_WHATSAPP_URL,
  SMS_CREDIT_TXN_LABELS,
} from "@/lib/constants";
import {
  getPortalTransactions,
  getPublicSmsPackages,
} from "@/lib/data/sms-portal";
import { formatDateTime, formatFcfa } from "@/lib/format";
import { requirePortalSession } from "@/lib/sms-portal/session";

export const metadata = { title: "Crédits" };

type PageProps = { searchParams: Promise<{ page?: string }> };

export default async function SmsCreditsPage({ searchParams }: PageProps) {
  const { account } = await requirePortalSession();
  const page = parsePage((await searchParams).page);
  const [packages, ledger] = await Promise.all([
    getPublicSmsPackages(),
    getPortalTransactions(account.id, page),
  ]);
  const fmt = new Intl.NumberFormat("fr-FR");
  const whatsappText = encodeURIComponent(
    `Bonjour, je souhaite recharger mon compte SMS (${account.companyName}, ${account.contactEmail}).`,
  );
  const contactClass =
    "border-glass-stroke text-on-surface hover:border-primary flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors";

  return (
    <>
      <PageHeader title="Crédits" />

      <div className="gap-gutter grid grid-cols-1 lg:grid-cols-3">
        <GlassCard hover={false} className="p-6">
          <p className="text-label-caps text-on-surface-variant tracking-widest uppercase">
            Solde
          </p>
          <p className="text-on-surface mt-2 text-5xl font-bold tabular-nums">
            {fmt.format(account.creditBalance)}
          </p>
          <p className="text-on-surface-variant mt-2 text-sm">
            crédits · 1 crédit = 1 SMS vers le Cameroun. Un message long ou avec
            accents (ê, ç…) peut compter plusieurs SMS. Les crédits
            n&rsquo;expirent pas.
          </p>
        </GlassCard>

        <GlassCard hover={false} className="p-6 lg:col-span-2">
          <h2 className="text-headline-sm text-on-surface">Recharger</h2>
          <p className="text-on-surface-variant mt-1 mb-4 text-sm">
            Choisissez un forfait, payez par Mobile Money ou virement, puis
            envoyez-nous la référence du paiement : votre solde est crédité dès
            validation.
          </p>
          {packages.length > 0 ? (
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {packages.map((p) => (
                <div
                  key={p.id}
                  className="border-glass-stroke/50 bg-surface-container/50 rounded-lg border p-4"
                >
                  <p className="text-on-surface font-bold">{p.name}</p>
                  <p className="text-headline-sm text-primary mt-1">
                    {formatFcfa(p.priceFcfa)}
                  </p>
                  <p className="text-on-surface-variant text-sm">
                    {fmt.format(p.credits)} SMS ·{" "}
                    {formatFcfa(Math.round(p.priceFcfa / p.credits))} / SMS
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <a
              href={`${COMPANY_WHATSAPP_URL}?text=${whatsappText}`}
              className={contactClass}
            >
              <MessageCircle
                className="text-primary h-5 w-5"
                aria-hidden="true"
              />
              WhatsApp
            </a>
            <a href={COMPANY_PHONE_TEL} className={contactClass}>
              <Phone className="text-primary h-5 w-5" aria-hidden="true" />
              {COMPANY_PHONE}
            </a>
            <a href={COMPANY_EMAIL_MAILTO} className={contactClass}>
              <Mail className="text-primary h-5 w-5" aria-hidden="true" />
              <span className="truncate">{COMPANY_EMAIL}</span>
            </a>
          </div>
        </GlassCard>
      </div>

      <GlassCard hover={false} className="p-0">
        <h2 className="text-headline-sm text-on-surface p-6 pb-2">
          Mouvements
        </h2>
        {ledger.items.length === 0 ? (
          <p className="text-on-surface-variant px-6 pb-6">Aucun mouvement.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-glass-stroke/50 text-label-caps text-on-surface-variant border-b uppercase">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Détail</th>
                  <th className="px-4 py-3 text-right">Crédits</th>
                  <th className="px-4 py-3 text-right">Solde</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {ledger.items.map((t) => (
                  <tr
                    key={t.id}
                    className="border-glass-stroke/30 border-b last:border-0"
                  >
                    <td className="text-on-surface-variant px-4 py-3 whitespace-nowrap">
                      {formatDateTime(t.createdAt)}
                    </td>
                    <td className="text-on-surface px-4 py-3">
                      {SMS_CREDIT_TXN_LABELS[t.type]}
                    </td>
                    <td className="text-on-surface-variant px-4 py-3">
                      {/* Admin notes are internal; customers see the package and amount. */}
                      {t.type === "TOPUP"
                        ? [
                            t.package?.name,
                            t.amountFcfa != null
                              ? formatFcfa(t.amountFcfa)
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : t.type === "DEBIT"
                          ? "Envoi de SMS"
                          : t.type === "REFUND"
                            ? "Envoi en échec, crédits rendus"
                            : "Correction"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        t.credits >= 0
                          ? "text-green-700 dark:text-green-400"
                          : "text-on-surface"
                      }`}
                    >
                      {t.credits > 0
                        ? `+${fmt.format(t.credits)}`
                        : fmt.format(t.credits)}
                    </td>
                    <td className="text-on-surface-variant px-4 py-3 text-right">
                      {fmt.format(t.balanceAfter)}
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
        pages={ledger.pages}
        basePath="/sms/credits"
        params={{}}
      />
    </>
  );
}
