import { QUOTE_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export type DevisStatusEventRow = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: Date | string;
};

export function DevisStatusTimeline({
  events,
}: {
  events: DevisStatusEventRow[];
}) {
  if (events.length === 0) {
    return (
      <p className="text-on-surface-variant">
        Aucun historique pour le moment.
      </p>
    );
  }

  return (
    <div className="border-surface-variant space-y-6 border-l-2 pl-4">
      {events.map((event, index) => (
        <div key={event.id} className="relative">
          <span
            className={`absolute top-1 -left-[21px] h-3 w-3 rounded-full ${
              index === 0
                ? "bg-primary shadow-[0_0_8px_var(--color-glow)]"
                : "bg-surface-variant"
            }`}
          />
          <p className="text-on-surface text-sm font-semibold">
            Statut&nbsp;:{" "}
            {QUOTE_STATUS_LABELS[event.toStatus] ?? event.toStatus}
          </p>
          <p className="text-on-surface-variant mt-1 text-xs">
            {formatDateTime(event.createdAt)}
          </p>
        </div>
      ))}
    </div>
  );
}
