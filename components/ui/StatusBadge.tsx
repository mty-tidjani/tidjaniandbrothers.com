import { cn } from "@/lib/utils";
import { LEAD_STATUS_LABELS, LEAD_STATUS_STYLES } from "@/lib/constants";

export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold tracking-wider uppercase",
      LEAD_STATUS_STYLES[status] ?? LEAD_STATUS_STYLES.PERDU,
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {LEAD_STATUS_LABELS[status] ?? status}
  </span>
);
