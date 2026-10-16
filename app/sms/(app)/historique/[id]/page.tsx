import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SmsBadge } from "@/components/admin/sms/SmsBadge";
import { PageHeader } from "@/components/sms-portal/PageHeader";
import { getPortalMessage } from "@/lib/data/sms-portal";
import { formatDateTime } from "@/lib/format";
import { toApiMessage } from "@/lib/sms/gateway";
import { PORTAL_ERROR_LABELS } from "@/lib/sms-portal/messages";
import { requirePortalSession } from "@/lib/sms-portal/session";

export const metadata = { title: "Détail de l'envoi" };

type PageProps = { params: Promise<{ id: string }> };

export default async function SmsMessageDetailPage({ params }: PageProps) {
  const { account } = await requirePortalSession();
  const { id } = await params;
  const message = await getPortalMessage(account.id, id);
  if (!message) notFound();

  // Same customer-facing view as the API: never raw 1s2u codes.
  const view = toApiMessage(message);
  const facts = [
    ["Date", formatDateTime(message.createdAt)],
    ["Expéditeur", view.sender],
    ["Encodage", view.encoding === "unicode" ? "Unicode" : "Standard (GSM)"],
    ["SMS par destinataire", String(view.parts)],
    ["Destinataires", String(view.recipients)],
    ["Crédits utilisés", String(view.creditsCharged)],
    ["Crédits remboursés", String(view.creditsRefunded)],
    ["Envoyé via", message.apiKeyId ? "API" : "Espace web"],
  ];

  return (
    <>
      <div className="text-on-surface-variant flex items-center gap-2 text-sm">
        <Link href="/sms/historique" className="hover:text-primary">
          Historique
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="text-on-surface font-mono">{message.id}</span>
      </div>
      <PageHeader
        title="Détail de l'envoi"
        actions={<SmsBadge kind="message" status={message.status} />}
      />

      <div className="gap-gutter grid grid-cols-1 lg:grid-cols-3">
        <GlassCard hover={false} className="p-6 lg:col-span-2">
          <h2 className="text-headline-sm text-on-surface mb-3">Message</h2>
          <p className="border-glass-stroke bg-surface-container-highest text-on-surface rounded-lg border p-4 whitespace-pre-wrap">
            {message.body}
          </p>
        </GlassCard>
        <GlassCard hover={false} className="p-6">
          <dl className="space-y-3 text-sm">
            {facts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">{label}</dt>
                <dd className="text-on-surface text-right font-medium">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </GlassCard>
      </div>

      <GlassCard hover={false} className="p-6">
        <h2 className="text-headline-sm text-on-surface mb-1">Destinataires</h2>
        <p className="text-on-surface-variant mb-4 text-sm">
          « Transmis » signifie accepté par l&rsquo;opérateur ; la réception sur
          le téléphone n&rsquo;est pas encore confirmée.
        </p>
        <ul className="space-y-3">
          {view.batches.map((batch, i) => (
            <li
              key={i}
              className="border-glass-stroke/50 rounded-lg border p-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <SmsBadge
                  kind="message"
                  status={batch.status === "submitted" ? "SENT" : "FAILED"}
                />
                {batch.error ? (
                  <span className="text-error text-sm">
                    {PORTAL_ERROR_LABELS[batch.error.code]}
                    {batch.error.retryable ? " Vous pouvez réessayer." : ""}
                  </span>
                ) : (
                  <span className="text-on-surface-variant text-sm">
                    Transmis
                  </span>
                )}
              </div>
              <p className="text-on-surface-variant font-mono text-sm break-words">
                {batch.recipients.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </GlassCard>
    </>
  );
}
