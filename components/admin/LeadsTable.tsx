import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { initials, formatDate } from "@/lib/format";

export type LeadRow = {
  id: string;
  fullName: string;
  company: string;
  phone: string;
  servicesWanted: string[];
  createdAt: Date | string;
  status: string;
};

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) {
    return (
      <p className="text-on-surface-variant p-6 text-center">
        Aucune demande pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-glass-stroke/50 border-b">
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Nom
            </th>
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Entreprise
            </th>
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Service
            </th>
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Date
            </th>
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Statut
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="group border-glass-stroke/30 hover:bg-surface-variant/10 border-b transition-colors last:border-0"
            >
              <td className="px-4 py-4">
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="text-on-surface group-hover:text-primary flex items-center gap-3 font-medium"
                >
                  <span className="bg-surface-variant text-on-surface-variant flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {initials(lead.fullName)}
                  </span>
                  {lead.fullName}
                </Link>
              </td>
              <td className="text-on-surface-variant px-4 py-4">
                {lead.company}
              </td>
              <td className="text-on-surface-variant px-4 py-4">
                {lead.servicesWanted[0] ?? "—"}
              </td>
              <td className="text-on-surface-variant px-4 py-4">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={lead.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
