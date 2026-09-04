import Link from "next/link";
import { DevisStatusBadge } from "@/components/admin/DevisStatusBadge";
import { formatDateTime } from "@/lib/format";

export type DevisRow = {
  id: string;
  companyName: string | null;
  contactName: string | null;
  status: string;
  currentStep: number;
  updatedAt: Date | string;
  budgetMentioned: string | null;
};

export function DevisTable({ devis }: { devis: DevisRow[] }) {
  if (devis.length === 0) {
    return (
      <p className="text-on-surface-variant p-6 text-center">
        Aucune demande de devis pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-glass-stroke/50 border-b">
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Entreprise
            </th>
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Contact
            </th>
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Statut
            </th>
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Étape atteinte
            </th>
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Dernière activité
            </th>
            <th className="text-label-caps text-on-surface-variant px-4 py-3 uppercase">
              Budget mentionné
            </th>
          </tr>
        </thead>
        <tbody>
          {devis.map((row) => (
            <tr
              key={row.id}
              className="group border-glass-stroke/30 hover:bg-surface-variant/10 border-b transition-colors last:border-0"
            >
              <td className="px-4 py-4">
                <Link
                  href={`/admin/devis/${row.id}`}
                  className="text-on-surface group-hover:text-primary font-medium"
                >
                  {row.companyName ?? "Entreprise non renseignée"}
                </Link>
              </td>
              <td className="text-on-surface-variant px-4 py-4">
                {row.contactName ?? "—"}
              </td>
              <td className="px-4 py-4">
                <DevisStatusBadge status={row.status} />
              </td>
              <td className="text-on-surface-variant px-4 py-4">
                {row.currentStep}/9
              </td>
              <td className="text-on-surface-variant px-4 py-4">
                {formatDateTime(row.updatedAt)}
              </td>
              <td className="text-on-surface-variant px-4 py-4">
                {row.budgetMentioned ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
