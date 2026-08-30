import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type StatWidgetProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  hint?: string;
};

export function StatWidget({
  label,
  value,
  icon: Icon,
  trend,
  hint,
}: StatWidgetProps) {
  return (
    <GlassCard className="flex h-40 flex-col justify-between p-6">
      <div className="flex items-start justify-between">
        <span className="text-label-caps text-on-surface-variant tracking-widest uppercase">
          {label}
        </span>
        <div className="border-primary-container/20 bg-primary-container/10 text-primary flex h-8 w-8 items-center justify-center rounded-full border">
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </div>
      </div>
      <div>
        <div className="text-headline-md text-on-surface">{value}</div>
        {trend ? (
          <div className="text-primary mt-1 flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            {trend}
          </div>
        ) : hint ? (
          <div className="text-on-surface-variant mt-1 text-sm">{hint}</div>
        ) : null}
      </div>
    </GlassCard>
  );
}
