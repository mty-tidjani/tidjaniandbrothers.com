import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/GlassCard";
import { Select } from "@/components/ui/Select";
import { DevisTable } from "@/components/admin/DevisTable";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_ORDER } from "@/lib/constants";
import { getFilteredDevis } from "@/lib/data/devis";

export const metadata: Metadata = {
  title: "Devis",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ status?: string; step?: string }>;
};

export default async function AdminDevisPage({ searchParams }: PageProps) {
  const { status, step } = await searchParams;
  const devis = await getFilteredDevis({ status, step });

  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">Devis</h1>
        <p className="text-on-surface-variant mt-1">
          Suivez les demandes de devis, y compris les brouillons abandonnés.
        </p>
      </header>

      <GlassCard hover={false} className="p-4">
        <form className="flex flex-wrap gap-3 lg:justify-end">
          <Select
            name="status"
            defaultValue={status ?? ""}
            className="min-w-[160px]"
          >
            <option value="">Tous les statuts</option>
            {QUOTE_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {QUOTE_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select
            name="step"
            defaultValue={step ?? ""}
            className="min-w-[160px]"
          >
            <option value="">Toutes les étapes</option>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Étape {n}/9
              </option>
            ))}
          </Select>
          <button
            type="submit"
            className="border-primary text-primary hover:bg-primary-container/10 rounded-lg border px-4 py-2 text-sm font-bold transition-colors"
          >
            Filtrer
          </button>
        </form>
      </GlassCard>

      <GlassCard hover={false} className="p-0">
        <DevisTable devis={devis} />
      </GlassCard>
    </div>
  );
}
