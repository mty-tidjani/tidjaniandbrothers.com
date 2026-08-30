import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Phone,
  Mail,
  Info,
  MessageSquare,
  NotebookPen,
  History,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusSelectForm } from "@/components/admin/StatusSelectForm";
import { StatusTimeline } from "@/components/admin/StatusTimeline";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SECTORS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { getLeadById } from "@/lib/data/leads";
import { addLeadNote } from "@/lib/actions/leads";

export const metadata: Metadata = {
  title: "Détail de la demande",
  robots: { index: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const sectorLabel =
    SECTORS.find((s) => s.value === lead.sector)?.label ?? lead.sector;

  return (
    <div className="gap-stack-md flex flex-col">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="text-on-surface-variant mb-2 flex items-center gap-2 text-sm">
            <Link href="/admin/leads" className="hover:text-primary">
              Demandes
            </Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="text-on-surface">{lead.fullName}</span>
          </div>
          <h1 className="text-headline-md text-on-surface flex items-center gap-3">
            {lead.fullName}
            <StatusBadge status={lead.status} />
          </h1>
          <p className="text-on-surface-variant mt-1">{lead.company}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            href={`tel:${lead.phone.replace(/\s+/g, "")}`}
            variant="secondary"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Appeler
          </Button>
          <Button href={`mailto:${lead.email}`}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Envoyer un email
          </Button>
        </div>
      </header>

      <div className="gap-gutter grid grid-cols-1 lg:grid-cols-3">
        <div className="space-y-stack-md lg:col-span-2">
          <GlassCard className="p-6">
            <h2 className="border-glass-stroke text-headline-sm text-on-surface mb-6 flex items-center gap-2 border-b pb-4">
              <Info className="text-primary h-5 w-5" aria-hidden="true" />
              Informations du contact
            </h2>
            <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <dt className="text-label-caps text-on-surface-variant mb-1">
                  Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-primary hover:underline"
                  >
                    {lead.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-label-caps text-on-surface-variant mb-1">
                  Téléphone
                </dt>
                <dd>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-primary hover:underline"
                  >
                    {lead.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-label-caps text-on-surface-variant mb-1">
                  Secteur d&rsquo;activité
                </dt>
                <dd className="text-on-surface">{sectorLabel}</dd>
              </div>
              <div>
                <dt className="text-label-caps text-on-surface-variant mb-1">
                  Service demandé
                </dt>
                <dd className="flex flex-wrap gap-2">
                  {lead.servicesWanted.map((service) => (
                    <span
                      key={service}
                      className="border-glass-stroke bg-surface-variant text-on-surface rounded-md border px-3 py-1 text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </dd>
              </div>
              {lead.preferredSlot ? (
                <div>
                  <dt className="text-label-caps text-on-surface-variant mb-1">
                    Créneau préféré
                  </dt>
                  <dd className="text-on-surface">{lead.preferredSlot}</dd>
                </div>
              ) : null}
            </dl>
          </GlassCard>

          {lead.message ? (
            <GlassCard className="p-6">
              <h2 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                <MessageSquare
                  className="text-primary h-5 w-5"
                  aria-hidden="true"
                />
                Message initial
              </h2>
              <div className="border-glass-stroke bg-surface-container-highest text-on-surface rounded-lg border p-4">
                {lead.message}
              </div>
              <p className="text-on-surface-variant mt-3 text-right text-xs">
                Reçu le {formatDateTime(lead.createdAt)}
              </p>
            </GlassCard>
          ) : null}

          <GlassCard className="p-6">
            <h2 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
              <NotebookPen
                className="text-primary h-5 w-5"
                aria-hidden="true"
              />
              Notes internes
            </h2>
            <form action={addLeadNote} className="mb-4 flex flex-col gap-2">
              <input type="hidden" name="leadId" value={lead.id} />
              <label htmlFor="note-body" className="sr-only">
                Ajouter une note
              </label>
              <Textarea
                id="note-body"
                name="body"
                rows={3}
                placeholder="Ajouter une note ou un résumé d'appel..."
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="border-glass-stroke text-on-surface hover:border-primary hover:text-primary rounded-lg border px-4 py-2 text-sm transition-colors"
                >
                  Sauvegarder la note
                </button>
              </div>
            </form>
            <div className="space-y-4">
              {lead.notes.map((note) => (
                <div
                  key={note.id}
                  className="border-glass-stroke/50 bg-surface-container/50 flex gap-4 rounded-lg border p-4"
                >
                  <div className="bg-primary-container/20 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {note.author.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-on-surface text-sm font-semibold">
                        {note.author.name}
                      </span>
                      <span className="text-on-surface-variant text-xs">
                        {formatDateTime(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-sm">
                      {note.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-stack-md">
          <GlassCard className="p-6">
            <h2 className="text-headline-sm text-on-surface mb-4">
              Statut du lead
            </h2>
            <StatusSelectForm leadId={lead.id} status={lead.status} />
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-headline-sm text-on-surface mb-6 flex items-center gap-2">
              <History className="text-primary h-5 w-5" aria-hidden="true" />
              Historique
            </h2>
            <StatusTimeline events={lead.statusEvents} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
