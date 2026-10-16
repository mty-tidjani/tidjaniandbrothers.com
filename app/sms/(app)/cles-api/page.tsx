import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ActionForm } from "@/components/admin/sms/ActionForm";
import { IssueApiKeyForm } from "@/components/admin/sms/IssueApiKeyForm";
import { SmsBadge } from "@/components/admin/sms/SmsBadge";
import { smsDangerButton } from "@/components/admin/sms/buttons";
import { PageHeader } from "@/components/sms-portal/PageHeader";
import {
  createPortalApiKey,
  revokePortalApiKey,
} from "@/lib/actions/sms-portal";
import { getPortalApiKeys, getPortalSenderIds } from "@/lib/data/sms-portal";
import { formatDateTime } from "@/lib/format";
import { requirePortalSession } from "@/lib/sms-portal/session";

export const metadata = { title: "Clés API" };

export default async function SmsApiKeysPage() {
  const { account } = await requirePortalSession();
  const [keys, senders] = await Promise.all([
    getPortalApiKeys(account.id),
    getPortalSenderIds(account.id),
  ]);
  const approved = senders.filter((s) => s.status === "APPROVED");

  return (
    <>
      <PageHeader
        title="Clés API"
        description={
          <>
            Pour envoyer des SMS depuis votre logiciel ou site. Chaque clé est
            liée à un nom d&rsquo;expéditeur.{" "}
            <Link
              href="/sms/documentation"
              className="text-primary hover:underline"
            >
              Voir la documentation
            </Link>
          </>
        }
      />

      <GlassCard hover={false} className="p-6">
        <h2 className="text-headline-sm text-on-surface mb-4">Nouvelle clé</h2>
        <IssueApiKeyForm
          action={createPortalApiKey}
          senders={approved.map((s) => ({
            id: s.id,
            value: s.value,
            status: s.status,
          }))}
          emptyMessage="Il vous faut un nom d'expéditeur approuvé pour créer une clé."
        />
        <p className="text-on-surface-variant mt-3 text-sm">
          Gardez vos clés secrètes : ne les mettez jamais dans une page web ou
          une application mobile. En cas de fuite, révoquez la clé et créez-en
          une nouvelle.
        </p>
      </GlassCard>

      <GlassCard hover={false} className="p-0">
        {keys.length === 0 ? (
          <p className="text-on-surface-variant p-6 text-center">Aucune clé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-glass-stroke/50 text-label-caps text-on-surface-variant border-b uppercase">
                  <th className="px-4 py-3">Libellé</th>
                  <th className="px-4 py-3">Clé</th>
                  <th className="px-4 py-3">Expéditeur</th>
                  <th className="px-4 py-3">Créée le</th>
                  <th className="px-4 py-3">Dernière utilisation</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr
                    key={k.id}
                    className={`border-glass-stroke/30 border-b last:border-0 ${k.revokedAt ? "opacity-50" : ""}`}
                  >
                    <td className="text-on-surface px-4 py-3">{k.label}</td>
                    <td className="text-on-surface-variant px-4 py-3 font-mono">
                      {k.keyPrefix}…
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-on-surface mr-2">
                        {k.senderId.value}
                      </span>
                      {k.senderId.status !== "APPROVED" ? (
                        <SmsBadge kind="sender" status={k.senderId.status} />
                      ) : null}
                    </td>
                    <td className="text-on-surface-variant px-4 py-3 whitespace-nowrap">
                      {formatDateTime(k.createdAt)}
                    </td>
                    <td className="text-on-surface-variant px-4 py-3 whitespace-nowrap">
                      {k.lastUsedAt ? formatDateTime(k.lastUsedAt) : "Jamais"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {k.revokedAt ? (
                        <span className="text-on-surface-variant">
                          Révoquée
                        </span>
                      ) : (
                        <ActionForm
                          action={revokePortalApiKey}
                          confirmMessage="Révoquer cette clé ? Les envois qui l'utilisent cesseront immédiatement."
                        >
                          <input type="hidden" name="keyId" value={k.id} />
                          <button type="submit" className={smsDangerButton}>
                            Révoquer
                          </button>
                        </ActionForm>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </>
  );
}
