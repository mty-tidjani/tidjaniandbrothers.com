import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPriceRange } from "@/lib/format";

type PricingTierProps = {
  name: string;
  priceMin: number;
  priceMax: number | null;
  features: string[];
  maxUsers?: string | null;
  featured?: boolean;
};

export function PricingTier({
  name,
  priceMin,
  priceMax,
  features,
  maxUsers,
  featured = false,
}: PricingTierProps) {
  return (
    <div
      className={cn(
        "glass-card gap-stack-md flex h-full flex-col rounded-xl p-6",
        featured &&
          "border-primary-container relative z-10 shadow-[0_0_30px_var(--color-glow)] md:scale-105",
      )}
    >
      {featured ? (
        <span className="bg-primary-container text-on-accent absolute top-0 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
          Recommandé
        </span>
      ) : null}
      <h3
        className={cn(
          "text-label-caps",
          featured ? "text-primary" : "text-on-surface-variant",
        )}
      >
        {name}
      </h3>
      <div className="text-headline-sm text-on-surface">
        {formatPriceRange(priceMin, priceMax)}{" "}
        <span className="text-on-surface-variant text-sm font-normal">
          FCFA
        </span>
      </div>
      {maxUsers ? (
        <p className="text-on-surface-variant text-sm">{maxUsers}</p>
      ) : null}
      <ul className="text-on-surface-variant flex-1 space-y-3 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check
              className="text-primary h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
