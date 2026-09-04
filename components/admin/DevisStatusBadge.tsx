import { cn } from "@/lib/utils";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_STYLES } from "@/lib/constants";

export const DevisStatusBadge = ({ status }: { status: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold tracking-wider uppercase",
      QUOTE_STATUS_STYLES[status] ?? QUOTE_STATUS_STYLES.PERDU,
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {QUOTE_STATUS_LABELS[status] ?? status}
  </span>
);
