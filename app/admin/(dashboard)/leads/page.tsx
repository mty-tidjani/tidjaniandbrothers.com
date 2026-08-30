import type { Metadata } from "next";
import { Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from "@/lib/constants";
import { getFilteredLeads } from "@/lib/data/leads";

export const metadata: Metadata = {
  title: "Demandes",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ status?: string; service?: string; q?: string }>;
};

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const { status, service, q } = await searchParams;
  const leads = await getFilteredLeads({ status, service, search: q });

  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">Demandes / Leads</h1>
        <p className="text-on-surface-variant mt-1">
          Suivez et gérez les demandes entrantes.
        </p>
      </header>

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
              placeholder="Rechercher par nom, entreprise..."
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
              {LEAD_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
            <Select
              name="service"
              defaultValue={service ?? ""}
              className="min-w-[160px]"
            >
              <option value="">Tous les services</option>
              <option value="odoo_installation">Installation Odoo</option>
              <option value="odoo_support">Support Odoo</option>
              <option value="web">Site web</option>
            </Select>
            <button
              type="submit"
              className="border-primary text-primary hover:bg-primary-container/10 rounded-lg border px-4 py-2 text-sm font-bold transition-colors"
            >
              Filtrer
            </button>
          </div>
        </form>
      </GlassCard>

      <GlassCard hover={false} className="p-0">
        <LeadsTable leads={leads} />
      </GlassCard>
    </div>
  );
}
