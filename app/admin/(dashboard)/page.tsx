import type { Metadata } from "next";
import Link from "next/link";
import {
  Inbox,
  CalendarClock,
  FileText,
  TrendingUp,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { StatWidget } from "@/components/admin/StatWidget";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { GlassCard } from "@/components/ui/GlassCard";
import { getDashboardStats } from "@/lib/data/dashboard";
import { getRecentLeads } from "@/lib/data/leads";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  const [stats, recentLeads] = await Promise.all([
    getDashboardStats(),
    getRecentLeads(5),
  ]);

  return (
    <div className="gap-stack-lg flex flex-col">
      <header className="border-glass-stroke pb-stack-md border-b">
        <h1 className="text-headline-md text-on-surface">Tableau de bord</h1>
        <p className="text-on-surface-variant mt-1">
          Bienvenue sur le terminal admin Tidjani & Brothers.
        </p>
      </header>

      <div className="gap-stack-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget
          label="Nouvelles demandes cette semaine"
          value={String(stats.newThisWeek)}
          icon={Inbox}
          hint="Depuis lundi"
        />
        <StatWidget
          label="Audits à planifier"
          value={String(stats.auditsToSchedule)}
          icon={CalendarClock}
          hint="Action requise"
        />
        <StatWidget
          label="Articles publiés ce mois"
          value={String(stats.postsThisMonth)}
          icon={FileText}
          hint="Sur le blog"
        />
        <StatWidget
          label="Taux de conversion"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          hint="Demandes → clients"
        />
        <StatWidget
          label="Devis en cours"
          value={String(stats.enCoursCount)}
          icon={ClipboardList}
          hint="Soumis ou envoyés"
        />
        <StatWidget
          label="Taux de complétion du formulaire"
          value={`${stats.completionRate.toFixed(1)}%`}
          icon={FileText}
          hint={stats.dropoffHint}
        />
      </div>

      <GlassCard hover={false} className="p-stack-md">
        <div className="mb-stack-md border-glass-stroke flex items-center justify-between border-b pb-4">
          <h2 className="text-headline-sm text-on-surface">
            Demandes récentes
          </h2>
          <Link
            href="/admin/leads"
            className="text-label-caps text-primary flex items-center gap-1 tracking-widest uppercase hover:underline"
          >
            Voir toutes les demandes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <LeadsTable leads={recentLeads} />
      </GlassCard>
    </div>
  );
}
