import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { MessageComposer } from "@/components/sms-portal/MessageComposer";
import { PageHeader } from "@/components/sms-portal/PageHeader";
import { getPortalSenderIds } from "@/lib/data/sms-portal";
import { requirePortalSession } from "@/lib/sms-portal/session";

export const metadata = { title: "Envoyer un SMS" };

export default async function SmsSendPage() {
  const { account } = await requirePortalSession();
  const senders = (await getPortalSenderIds(account.id)).filter(
    (s) => s.status === "APPROVED",
  );

  const blocker =
    account.status !== "ACTIVE"
      ? "L'envoi sera possible dès que votre compte sera activé."
      : senders.length === 0
        ? "Il vous faut un nom d'expéditeur approuvé pour envoyer."
        : account.creditBalance === 0
          ? "Votre solde est vide : rechargez pour envoyer."
          : null;

  return (
    <>
      <PageHeader
        title="Envoyer un SMS"
        description="À un ou plusieurs destinataires (300 maximum par envoi). Pour des envois automatisés, utilisez l'API."
      />
      <GlassCard hover={false} className="p-6">
        {blocker ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-on-surface">{blocker}</p>
            <div className="flex gap-4 text-sm">
              <Link
                href="/sms/expediteurs"
                className="text-primary hover:underline"
              >
                Mes expéditeurs
              </Link>
              <Link
                href="/sms/credits"
                className="text-primary hover:underline"
              >
                Recharger
              </Link>
            </div>
          </div>
        ) : (
          <MessageComposer
            senders={senders.map((s) => ({ id: s.id, value: s.value }))}
            balance={account.creditBalance}
          />
        )}
      </GlassCard>
    </>
  );
}
