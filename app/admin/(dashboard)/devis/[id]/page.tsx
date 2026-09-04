import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Phone, Mail, History, NotebookPen } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DevisStatusBadge } from "@/components/admin/DevisStatusBadge";
import { DevisStatusSelectForm } from "@/components/admin/DevisStatusSelectForm";
import { DevisStatusTimeline } from "@/components/admin/DevisStatusTimeline";
import { DevisAnswerGroup } from "@/components/admin/DevisAnswerGroup";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DEVIS_SECTIONS, getSectionEntries } from "@/lib/devis-sections";
import { getDevisById } from "@/lib/data/devis";
import { updateDevisAdminDetails } from "@/lib/actions/devis";

export const metadata: Metadata = {
  title: "Détail du devis",
  robots: { index: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function DevisDetailPage({ params }: PageProps) {
  const { id } = await params;
  const devis = await getDevisById(id);
  if (!devis) notFound();

  const answers = (devis.answers as Record<string, Record<string, unknown>>) ?? {};
  const isDraft = devis.status === "BROUILLON";
  const hasContact = Boolean(devis.contactPhone || devis.contactEmail);

  return (
    <div className="gap-stack-md flex flex-col">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="text-on-surface-variant mb-2 flex items-center gap-2 text-sm">
            <Link href="/admin/devis" className="hover:text-primary">
              Devis
            </Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="text-on-surface">
              {devis.companyName ?? "Entreprise non renseignée"}
            </span>
          </div>
          <h1 className="text-headline-md text-on-surface flex items-center gap-3">
            {devis.companyName ?? "Entreprise non renseignée"}
            <DevisStatusBadge status={devis.status} />
          </h1>
          {devis.contactName ? (
            <p className="text-on-surface-variant mt-1">{devis.contactName}</p>
          ) : null}
        </div>
        {hasContact ? (
          <div className="flex items-center gap-3">
            {devis.contactPhone ? (
              <Button
                href={`tel:${devis.contactPhone.replace(/\s+/g, "")}`}
                variant="secondary"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Appeler
              </Button>
            ) : null}
            {devis.contactEmail ? (
              <Button href={`mailto:${devis.contactEmail}`}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Envoyer un email
              </Button>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="gap-gutter grid grid-cols-1 lg:grid-cols-3">
        <div className="space-y-stack-md lg:col-span-2">
          {isDraft ? (
            <GlassCard className="p-6">
              <h2 className="text-headline-sm text-on-surface mb-2">
                Brouillon en cours
              </h2>
              <p className="text-on-surface-variant">
                Dernière étape atteinte&nbsp;:{" "}
                <span className="text-primary font-bold">
                  {devis.currentStep}/9
                </span>
              </p>
              {!hasContact ? (
                <p className="text-on-surface-variant mt-2 text-sm">
                  Aucune coordonnée de contact n&rsquo;a encore été renseignée
                  (étape 9 non atteinte).
                </p>
              ) : null}
            </GlassCard>
          ) : null}

          {DEVIS_SECTIONS.filter((section) => answers[section.key]).map(
            (section) => (
              <DevisAnswerGroup
                key={section.key}
                title={section.title}
                entries={getSectionEntries(section, answers[section.key])}
              />
            ),
          )}

          <GlassCard className="p-6">
            <h2 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
              <NotebookPen className="text-primary h-5 w-5" aria-hidden="true" />
              Suivi commercial
            </h2>
            <form
              action={updateDevisAdminDetails}
              className="gap-stack-md flex flex-col"
            >
              <input type="hidden" name="devisId" value={devis.id} />
              <div>
                <label
                  htmlFor="proposedAmount"
                  className="text-label-caps text-on-surface mb-2 block"
                >
                  Montant du devis proposé (FCFA)
                </label>
                <Input
                  id="proposedAmount"
                  name="proposedAmount"
                  type="number"
                  min={0}
                  defaultValue={devis.proposedAmount ?? ""}
                  placeholder="750000"
                />
              </div>
              <div>
                <label
                  htmlFor="internalNote"
                  className="text-label-caps text-on-surface mb-2 block"
                >
                  Note interne
                </label>
                <Textarea
                  id="internalNote"
                  name="internalNote"
                  rows={3}
                  defaultValue={devis.internalNote ?? ""}
                  placeholder="Notes pour l'équipe commerciale..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="border-glass-stroke text-on-surface hover:border-primary hover:text-primary rounded-lg border px-4 py-2 text-sm transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        <div className="space-y-stack-md">
          <GlassCard className="p-6">
            <h2 className="text-headline-sm text-on-surface mb-4">
              Statut du devis
            </h2>
            <DevisStatusSelectForm devisId={devis.id} status={devis.status} />
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-headline-sm text-on-surface mb-6 flex items-center gap-2">
              <History className="text-primary h-5 w-5" aria-hidden="true" />
              Historique
            </h2>
            <DevisStatusTimeline events={devis.statusEvents} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
