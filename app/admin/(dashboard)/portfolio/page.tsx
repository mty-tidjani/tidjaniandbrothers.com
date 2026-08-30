import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { getAllCaseStudies } from "@/lib/data/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  robots: { index: false },
};

export default async function AdminPortfolioListPage() {
  const studies = await getAllCaseStudies();

  return (
    <div className="gap-stack-md flex flex-col">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">Portfolio</h1>
          <p className="text-on-surface-variant mt-1">
            Gérez les études de cas.
          </p>
        </div>
        <Button href="/admin/portfolio/new">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouvelle étude de cas
        </Button>
      </header>

      {studies.length === 0 ? (
        <GlassCard
          hover={false}
          className="text-on-surface-variant p-6 text-center"
        >
          Aucune étude de cas pour le moment.
        </GlassCard>
      ) : (
        <div className="gap-gutter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((study) => (
            <Link key={study.id} href={`/admin/portfolio/${study.id}`}>
              <GlassCard className="flex h-full flex-col p-6">
                <span
                  className={
                    study.published
                      ? "bg-primary-container/10 text-primary mb-3 w-fit rounded-full px-2.5 py-1 text-xs font-bold"
                      : "bg-surface-variant text-on-surface-variant mb-3 w-fit rounded-full px-2.5 py-1 text-xs font-bold"
                  }
                >
                  {study.published ? "Publié" : "Non publié"}
                </span>
                <h2 className="text-headline-sm text-on-surface mb-2">
                  {study.sector}
                </h2>
                <p className="text-on-surface-variant line-clamp-2 text-sm">
                  {study.after}
                </p>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
