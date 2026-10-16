import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { ActionForm } from "@/components/admin/sms/ActionForm";
import { SmsBadge } from "@/components/admin/sms/SmsBadge";
import { smsPrimaryButton } from "@/components/admin/sms/buttons";
import { PageHeader } from "@/components/sms-portal/PageHeader";
import { requestPortalSenderId } from "@/lib/actions/sms-portal";
import { getPortalSenderIds } from "@/lib/data/sms-portal";
import { formatDate } from "@/lib/format";
import { requirePortalSession } from "@/lib/sms-portal/session";

export const metadata = { title: "Expéditeurs" };

const STATUS_HELP: Record<string, string> = {
  PENDING_REVIEW:
    "Nous vérifions ce nom, généralement sous 1 à 2 jours ouvrés.",
  APPROVED: "Prêt : utilisable pour envoyer et pour créer des clés API.",
  BLOCKED: "Bloqué : les envois avec ce nom sont suspendus.",
  REJECTED: "Refusé.",
};

export default async function SmsSendersPage() {
  const { account } = await requirePortalSession();
  const senders = await getPortalSenderIds(account.id);

  return (
    <>
      <PageHeader
        title="Noms d'expéditeur"
        description="Le nom affiché à la place d'un numéro sur le téléphone de vos destinataires."
      />

      <GlassCard hover={false} className="p-6">
        <h2 className="text-headline-sm text-on-surface mb-1">
          Demander un nouveau nom
        </h2>
        <ul className="text-on-surface-variant mb-4 list-disc space-y-1 pl-5 text-sm">
          <li>
            3 à 11 caractères : lettres, chiffres, espace, « . », « & » ou « - »
          </li>
          <li>ou un numéro de 3 à 15 chiffres</li>
          <li>
            Le nom doit correspondre à votre entreprise ou marque : les noms
            d&rsquo;autres sociétés (banques, opérateurs…) sont refusés.
          </li>
        </ul>
        <ActionForm
          action={requestPortalSenderId}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
        >
          <Input
            name="value"
            placeholder="ex. MONSHOP"
            maxLength={16}
            required
            className="sm:max-w-xs"
            aria-label="Nom d'expéditeur"
          />
          <button type="submit" className={smsPrimaryButton}>
            Envoyer la demande
          </button>
        </ActionForm>
      </GlassCard>

      {senders.length === 0 ? (
        <GlassCard hover={false} className="p-6">
          <p className="text-on-surface-variant text-center">
            Aucun nom d&rsquo;expéditeur pour le moment.
          </p>
        </GlassCard>
      ) : (
        <ul className="flex flex-col gap-3">
          {senders.map((s) => (
            <li key={s.id}>
              <GlassCard
                hover={false}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-on-surface font-mono text-lg font-bold">
                      {s.value}
                    </span>
                    <SmsBadge kind="sender" status={s.status} />
                  </div>
                  <p className="text-on-surface-variant mt-1 text-sm">
                    {STATUS_HELP[s.status]}
                    {s.statusReason && s.status !== "APPROVED"
                      ? ` Motif : ${s.statusReason}`
                      : ""}
                  </p>
                </div>
                <p className="text-on-surface-variant shrink-0 text-sm">
                  {s._count.apiKeys} clé(s) · demandé le{" "}
                  {formatDate(s.createdAt)}
                </p>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
