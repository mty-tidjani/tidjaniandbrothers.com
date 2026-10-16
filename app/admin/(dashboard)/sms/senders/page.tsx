import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SenderIdActions } from "@/components/admin/sms/SenderIdActions";
import { SmsBadge } from "@/components/admin/sms/SmsBadge";
import { SmsSubNav } from "@/components/admin/sms/SmsSubNav";
import { smsSecondaryButton } from "@/components/admin/sms/buttons";
import { auth } from "@/lib/auth";
import {
  SMS_SENDER_ID_STATUS_LABELS,
  SMS_SENDER_ID_STATUS_ORDER,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getSmsSenderIds } from "@/lib/data/sms";

export const metadata: Metadata = {
  title: "SMS — Noms d'expéditeur",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminSmsSendersPage({ searchParams }: PageProps) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const { status, q } = await searchParams;
  const senders = await getSmsSenderIds({ status, search: q });

  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">SMS API</h1>
        <p className="text-on-surface-variant mt-1">
          Registre global des noms d&rsquo;expéditeur. Un nom est unique sur
          toute la plateforme ; un nom bloqué cesse d&rsquo;envoyer
          immédiatement, pour toutes ses clés, et reste réservé.
        </p>
      </header>

      <SmsSubNav active="/admin/sms/senders" />

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
              placeholder="Rechercher un nom ou une entreprise..."
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
              {SMS_SENDER_ID_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {SMS_SENDER_ID_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
            <button type="submit" className={smsSecondaryButton}>
              Filtrer
            </button>
          </div>
        </form>
      </GlassCard>

      {senders.length === 0 ? (
        <GlassCard hover={false} className="p-6">
          <p className="text-on-surface-variant text-center">
            Aucun nom d&rsquo;expéditeur.
          </p>
        </GlassCard>
      ) : (
        <ul className="flex flex-col gap-3">
          {senders.map((sender) => (
            <li key={sender.id}>
              <GlassCard
                hover={false}
                className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-on-surface font-mono text-lg font-bold">
                      {sender.value}
                    </span>
                    <SmsBadge kind="sender" status={sender.status} />
                  </div>
                  <p className="text-on-surface-variant mt-1 text-sm">
                    <Link
                      href={`/admin/sms/${sender.account.id}`}
                      className="text-primary hover:underline"
                    >
                      {sender.account.companyName}
                    </Link>{" "}
                    · {sender._count.apiKeys} clé(s) active(s) · ajouté le{" "}
                    {formatDate(sender.createdAt)}
                    {sender.statusReason ? ` · ${sender.statusReason}` : ""}
                  </p>
                </div>
                <div className="lg:w-[480px]">
                  <SenderIdActions
                    senderIdId={sender.id}
                    status={sender.status}
                  />
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
