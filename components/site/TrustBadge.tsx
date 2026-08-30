import type { LucideIcon } from "lucide-react";

type TrustBadgeProps = {
  icon: LucideIcon;
  label: string;
};

export function TrustBadge({ icon: Icon, label }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="text-primary h-6 w-6" aria-hidden="true" />
      <span className="text-label-caps text-on-surface">{label}</span>
    </div>
  );
}
