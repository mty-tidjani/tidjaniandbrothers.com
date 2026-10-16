import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ChevronRight,
  Info,
  BadgeCheck,
  KeyRound,
  MessagesSquare,
  Receipt,
  Wallet,
  ShieldAlert,
  History,
  UserRound,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ActionForm } from "@/components/admin/sms/ActionForm";
import { IssueApiKeyForm } from "@/components/admin/sms/IssueApiKeyForm";
import { PortalAccessForm } from "@/components/admin/sms/PortalAccessForm";
import { SenderIdActions } from "@/components/admin/sms/SenderIdActions";
import { SmsBadge } from "@/components/admin/sms/SmsBadge";
import { SmsEventTimeline } from "@/components/admin/sms/SmsEventTimeline";
import {
  smsDangerButton,
  smsPrimaryButton,
  smsSecondaryButton,
} from "@/components/admin/sms/buttons";
import { auth } from "@/lib/auth";
import {
  SMS_ACCOUNT_STATUS_LABELS,
  SMS_CREDIT_TXN_LABELS,
} from "@/lib/constants";
import { formatDateTime, formatFcfa } from "@/lib/format";
import { getSmsAccountById, getSmsPackages } from "@/lib/data/sms";
import {
  adjustSmsCredits,
  topUpSmsAccount,
  updateSmsAccountStatus,
} from "@/lib/actions/sms-accounts";
import { createSenderId } from "@/lib/actions/sms-sender-ids";
import { issueApiKey, revokeApiKey } from "@/lib/actions/sms-api-keys";

export const metadata: Metadata = {
  title: "Compte SMS",
  robots: { index: false },
};

type PageProps = { params: Promise<{ id: string }> };

const sectionTitle =
  "text-headline-sm text-on-surface mb-4 flex items-center gap-2";
const th = "px-3 py-2";
const td = "px-3 py-3";

export default async function SmsAccountDetailPage({ params }: PageProps) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const { id } = await params;
  const [account, packages] = await Promise.all([
    getSmsAccountById(id),
    getSmsPackages(),
  ]);
  if (!account) notFound();

  const activePackages = packages.filter((p) => p.active);
  const keySenders = account.senderIds.filter(
    (s) => s.status === "APPROVED" || s.status === "PENDING_REVIEW",
  );
  const nextStatuses = (["ACTIVE", "SUSPENDED", "DISABLED"] as const).filter(
    (s) => s !== account.status,
  );

  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <div className="text-on-surface-variant mb-2 flex items-center gap-2 text-sm">
          <Link href="/admin/sms" className="hover:text-primary">
            SMS
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="text-on-surface">{account.companyName}</span>
        </div>
        <h1 className="text-headline-md text-on-surface flex flex-wrap items-center gap-3">
          {account.companyName}
          <SmsBadge kind="account" status={account.status} />
        </h1>
        <p className="text-on-surface-variant mt-1">
          {account.contactName} · {account.contactEmail} ·{" "}
          {account.contactPhone}
        </p>
      </header>

      <div className="gap-gutter grid grid-cols-1 lg:grid-cols-3">
        <div className="space-y-stack-md min-w-0 lg:col-span-2">
          {account.notes ? (
            <GlassCard hover={false} className="p-6">
              <h2 className={sectionTitle}>
                <Info className="text-primary h-5 w-5" aria-hidden="true" />
                Notes internes
              </h2>
              <p className="text-on-surface-variant whitespace-pre-line">
                {account.notes}
              </p>
            </GlassCard>
          ) : null}

          <GlassCard hover={false} className="p-6">
            <h2 className={sectionTitle}>
              <BadgeCheck className="text-primary h-5 w-5" aria-hidden="true" />
              Noms d&rsquo;expéditeur (SID)
            </h2>
            {account.senderIds.length === 0 ? (
              <p className="text-on-surface-variant mb-4">
                Aucun nom d&rsquo;expéditeur.
              </p>
            ) : (
              <ul className="mb-4 space-y-4">
                {account.senderIds.map((sender) => (
                  <li
                    key={sender.id}
                    className="border-glass-stroke/50 bg-surface-container/50 flex flex-col gap-3 rounded-lg border p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-on-surface font-mono text-lg font-bold">
                        {sender.value}
                      </span>
                      <SmsBadge kind="sender" status={sender.status} />
                      {sender.statusReason ? (
                        <span className="text-on-surface-variant text-sm">
                          {sender.statusReason}
                        </span>
                      ) : null}
                    </div>
                    <SenderIdActions
                      senderIdId={sender.id}
                      status={sender.status}
                    />
                  </li>
                ))}
              </ul>
            )}
            <ActionForm
              action={createSenderId}
              className="flex flex-wrap items-center gap-3"
            >
              <input type="hidden" name="accountId" value={account.id} />
              <Input
                name="value"
                placeholder="ex. MYSHOP ou 237670000000"
                required
                maxLength={16}
                className="flex-1"
              />
              <button type="submit" className={smsSecondaryButton}>
                Ajouter un expéditeur
              </button>
            </ActionForm>
          </GlassCard>

          <GlassCard hover={false} className="p-6">
            <h2 className={sectionTitle}>
              <KeyRound className="text-primary h-5 w-5" aria-hidden="true" />
              Clés API
            </h2>
            {account.apiKeys.length > 0 ? (
              <div className="mb-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-glass-stroke/50 text-label-caps text-on-surface-variant border-b uppercase">
                      <th className={th}>Libellé</th>
                      <th className={th}>Clé</th>
                      <th className={th}>Expéditeur</th>
                      <th className={th}>Dernier usage</th>
                      <th className={th} />
                    </tr>
                  </thead>
                  <tbody>
                    {account.apiKeys.map((key) => (
                      <tr
                        key={key.id}
                        className={`border-glass-stroke/30 border-b last:border-0 ${
                          key.revokedAt ? "opacity-50" : ""
                        }`}
                      >
                        <td className={`${td} text-on-surface`}>{key.label}</td>
                        <td
                          className={`${td} text-on-surface-variant font-mono`}
                        >
                          {key.keyPrefix}…
                        </td>
                        <td className={td}>
                          <span className="text-on-surface mr-2">
                            {key.senderId.value}
                          </span>
                          {key.senderId.status !== "APPROVED" ? (
                            <SmsBadge
                              kind="sender"
                              status={key.senderId.status}
                            />
                          ) : null}
                        </td>
                        <td className={`${td} text-on-surface-variant`}>
                          {key.lastUsedAt
                            ? formatDateTime(key.lastUsedAt)
                            : "Jamais"}
                        </td>
                        <td className={`${td} text-right`}>
                          {key.revokedAt ? (
                            <span className="text-on-surface-variant">
                              Révoquée
                            </span>
                          ) : (
                            <ActionForm
                              action={revokeApiKey}
                              confirmMessage="Révoquer cette clé ? Les envois qui l'utilisent cesseront immédiatement."
                            >
                              <input
                                type="hidden"
                                name="keyId"
                                value={key.id}
                              />
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
            ) : null}
            <IssueApiKeyForm
              action={issueApiKey}
              senders={keySenders.map((s) => ({
                id: s.id,
                value: s.value,
                status: s.status,
              }))}
            />
          </GlassCard>

          <GlassCard hover={false} className="p-6">
            <h2 className={sectionTitle}>
              <MessagesSquare
                className="text-primary h-5 w-5"
                aria-hidden="true"
              />
              Derniers envois
            </h2>
            {account.messages.length === 0 ? (
              <p className="text-on-surface-variant">Aucun envoi.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-glass-stroke/50 text-label-caps text-on-surface-variant border-b uppercase">
                      <th className={th}>Date</th>
                      <th className={th}>Expéditeur</th>
                      <th className={th}>Destinataires</th>
                      <th className={th}>Parties</th>
                      <th className={th}>Crédits</th>
                      <th className={th}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.messages.map((message) => (
                      <tr
                        key={message.id}
                        className="border-glass-stroke/30 border-b last:border-0"
                      >
                        <td className={`${td} text-on-surface-variant`}>
                          {formatDateTime(message.createdAt)}
                        </td>
                        <td className={`${td} text-on-surface`}>
                          {message.senderValue}
                        </td>
                        <td
                          className={`${td} text-on-surface-variant`}
                          title={message.recipients.join(", ")}
                        >
                          {message.recipients.length === 1
                            ? message.recipients[0]
                            : `${message.recipients.length} numéros`}
                        </td>
                        <td className={`${td} text-on-surface-variant`}>
                          {message.parts} ({message.encoding})
                        </td>
                        <td className={`${td} text-on-surface-variant`}>
                          {message.creditsCharged - message.creditsRefunded}
                        </td>
                        <td className={td}>
                          <SmsBadge kind="message" status={message.status} />
                          {message.errorCode ? (
                            <span className="text-error ml-2 font-mono text-xs">
                              {message.errorCode}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          <GlassCard hover={false} className="p-6">
            <h2 className={sectionTitle}>
              <Receipt className="text-primary h-5 w-5" aria-hidden="true" />
              Mouvements de crédits
            </h2>
            {account.transactions.length === 0 ? (
              <p className="text-on-surface-variant">Aucun mouvement.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-glass-stroke/50 text-label-caps text-on-surface-variant border-b uppercase">
                      <th className={th}>Date</th>
                      <th className={th}>Type</th>
                      <th className={th}>Crédits</th>
                      <th className={th}>Solde</th>
                      <th className={th}>Détail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.transactions.map((txn) => (
                      <tr
                        key={txn.id}
                        className="border-glass-stroke/30 border-b last:border-0"
                      >
                        <td className={`${td} text-on-surface-variant`}>
                          {formatDateTime(txn.createdAt)}
                        </td>
                        <td className={`${td} text-on-surface`}>
                          {SMS_CREDIT_TXN_LABELS[txn.type]}
                        </td>
                        <td
                          className={`${td} font-medium ${
                            txn.credits >= 0 ? "text-green-400" : "text-error"
                          }`}
                        >
                          {txn.credits > 0 ? `+${txn.credits}` : txn.credits}
                        </td>
                        <td className={`${td} text-on-surface-variant`}>
                          {txn.balanceAfter}
                        </td>
                        <td className={`${td} text-on-surface-variant`}>
                          {[
                            txn.package?.name,
                            txn.amountFcfa != null
                              ? formatFcfa(txn.amountFcfa)
                              : null,
                            txn.note,
                            txn.actor?.name,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-stack-md">
          <GlassCard hover={false} className="p-6">
            <h2 className={sectionTitle}>
              <ShieldAlert
                className="text-primary h-5 w-5"
                aria-hidden="true"
              />
              Statut du compte
            </h2>
            <p className="text-on-surface-variant mb-4 text-sm">
              Effet immédiat : un compte non actif ne peut plus envoyer, quelle
              que soit la clé utilisée.
            </p>
            <ActionForm
              action={updateSmsAccountStatus}
              className="flex flex-col gap-3"
            >
              <input type="hidden" name="accountId" value={account.id} />
              <Select name="status" defaultValue={nextStatuses[0]}>
                {nextStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s === "ACTIVE"
                      ? "Activer"
                      : s === "SUSPENDED"
                        ? "Suspendre (temporaire)"
                        : "Désactiver (définitif)"}
                  </option>
                ))}
              </Select>
              <Input
                name="reason"
                placeholder="Motif (requis pour suspendre/désactiver)"
              />
              <button type="submit" className={smsPrimaryButton}>
                Mettre à jour
              </button>
            </ActionForm>
          </GlassCard>

          <GlassCard hover={false} className="p-6">
            <h2 className={sectionTitle}>
              <Wallet className="text-primary h-5 w-5" aria-hidden="true" />
              Crédits
            </h2>
            <p className="text-headline-md text-on-surface">
              {new Intl.NumberFormat("fr-FR").format(account.creditBalance)}
            </p>
            <p className="text-on-surface-variant mb-6 text-sm">
              crédits disponibles (1 crédit = 1 SMS vers le Cameroun)
            </p>

            <h3 className="text-label-caps text-on-surface mb-2 uppercase">
              Enregistrer un paiement
            </h3>
            <ActionForm
              action={topUpSmsAccount}
              className="mb-6 flex flex-col gap-3"
            >
              <input type="hidden" name="accountId" value={account.id} />
              <Select
                name="packageId"
                defaultValue={activePackages[0]?.id ?? ""}
              >
                {activePackages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.credits} crédits — {formatFcfa(p.priceFcfa)}
                  </option>
                ))}
                <option value="">Montant personnalisé…</option>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="credits"
                  type="number"
                  min={1}
                  placeholder="Crédits"
                  aria-label="Crédits (montant personnalisé)"
                />
                <Input
                  name="amountFcfa"
                  type="number"
                  min={0}
                  placeholder="Payé (FCFA)"
                  aria-label="Montant payé en FCFA (montant personnalisé)"
                />
              </div>
              <Input
                name="note"
                placeholder="Référence paiement (MoMo, virement…)"
              />
              <button type="submit" className={smsPrimaryButton}>
                Créditer
              </button>
            </ActionForm>

            <h3 className="text-label-caps text-on-surface mb-2 uppercase">
              Ajustement manuel
            </h3>
            <ActionForm
              action={adjustSmsCredits}
              className="flex flex-col gap-3"
            >
              <input type="hidden" name="accountId" value={account.id} />
              <Input
                name="credits"
                type="number"
                placeholder="ex. 50 ou -50"
                required
                aria-label="Crédits à ajouter ou retirer"
              />
              <Input name="note" placeholder="Motif" required />
              <button type="submit" className={smsSecondaryButton}>
                Ajuster
              </button>
            </ActionForm>
          </GlassCard>

          <GlassCard hover={false} className="p-6">
            <h2 className={sectionTitle}>
              <UserRound className="text-primary h-5 w-5" aria-hidden="true" />
              Accès Espace SMS
            </h2>
            {account.portalUsers.length === 0 ? (
              <p className="text-on-surface-variant mb-4 text-sm">
                Le client n&rsquo;a pas encore d&rsquo;accès à l&rsquo;espace
                client (/sms).
              </p>
            ) : (
              <ul className="mb-4 space-y-2 text-sm">
                {account.portalUsers.map((u) => (
                  <li key={u.id}>
                    <p className="text-on-surface font-medium">{u.email}</p>
                    <p className="text-on-surface-variant">
                      {u.passwordHash
                        ? u.lastLoginAt
                          ? `Dernière connexion : ${formatDateTime(u.lastLoginAt)}`
                          : "Jamais connecté"
                        : "Mot de passe pas encore défini"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <PortalAccessForm
              accountId={account.id}
              hasPassword={account.portalUsers.some((u) => u.passwordHash)}
            />
          </GlassCard>

          <GlassCard hover={false} className="p-6">
            <h2 className={sectionTitle}>
              <History className="text-primary h-5 w-5" aria-hidden="true" />
              Historique du statut
            </h2>
            <SmsEventTimeline
              events={account.statusEvents}
              labels={SMS_ACCOUNT_STATUS_LABELS}
            />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
