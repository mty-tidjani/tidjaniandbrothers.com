import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type ServiceCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  tag?: string;
};

export function ServiceCard({
  icon: Icon,
  title,
  description,
  href,
  tag,
}: ServiceCardProps) {
  return (
    <GlassCard className="flex flex-col gap-4 p-8">
      <div className="flex items-start justify-between">
        <div className="border-glass-stroke bg-surface-container flex h-12 w-12 items-center justify-center rounded-lg border">
          <Icon className="text-primary h-6 w-6" aria-hidden="true" />
        </div>
        {tag ? (
          <span className="border-glass-stroke bg-surface-dim text-label-caps text-outline rounded-full border px-3 py-1">
            {tag}
          </span>
        ) : null}
      </div>
      <h3 className="text-headline-sm text-on-surface">{title}</h3>
      <p className="text-on-surface-variant">{description}</p>
      <Link
        href={href}
        className="text-label-caps text-primary mt-auto flex items-center gap-1 hover:underline"
      >
        En savoir plus
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </GlassCard>
  );
}
