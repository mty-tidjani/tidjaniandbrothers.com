import { formatDateTime } from "@/lib/format";

type EventRow = {
  id: string;
  toStatus: string;
  reason: string | null;
  createdAt: Date | string;
  actor: { name: string } | null;
};

export function SmsEventTimeline({
  events,
  labels,
}: {
  events: EventRow[];
  labels: Record<string, string>;
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
            {labels[event.toStatus] ?? event.toStatus}
          </p>
          {event.reason ? (
            <p className="text-on-surface-variant mt-1 text-sm">
              {event.reason}
            </p>
          ) : null}
          <p className="text-on-surface-variant mt-1 text-xs">
            {formatDateTime(event.createdAt)}
            {event.actor ? ` · ${event.actor.name}` : " · Système"}
          </p>
        </div>
      ))}
    </div>
  );
}
