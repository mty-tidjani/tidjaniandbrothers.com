import { GlassCard } from "@/components/ui/GlassCard";

export function DevisAnswerGroup({
  title,
  entries,
}: {
  title: string;
  entries: { label: string; value: string }[];
}) {
  return (
    <GlassCard className="p-6">
      <h2 className="border-glass-stroke text-headline-sm text-on-surface mb-6 border-b pb-4">
        {title}
      </h2>
      <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {entries.map((entry) => (
          <div key={entry.label}>
            <dt className="text-label-caps text-on-surface-variant mb-1">
              {entry.label}
            </dt>
            <dd className="text-on-surface">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </GlassCard>
  );
}
