import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

type CaseStudyCardProps = {
  slug: string;
  sector: string;
  before: string;
  after: string;
  imagePath?: string | null;
  featured?: boolean;
};

export function CaseStudyCard({
  slug,
  sector,
  before,
  after,
  imagePath,
  featured = false,
}: CaseStudyCardProps) {
  return (
    <GlassCard
      className={featured ? "flex flex-col md:col-span-2" : "flex flex-col"}
    >
      <Link href={`/portfolio/${slug}`} className="flex flex-1 flex-col">
        {imagePath ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={imagePath}
              alt={`${sector} — étude de cas Tidjani & Brothers`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col p-8">
          {featured ? (
            <span className="text-label-caps text-primary mb-4">
              Étude de cas à la une
            </span>
          ) : null}
          <h3 className="text-headline-sm text-on-surface mb-4">{sector}</h3>
          <div className="space-y-4 text-sm">
            <div className="border-error/50 border-l-2 pl-4">
              <p className="text-label-caps text-error mb-1">Avant</p>
              <p className="text-on-surface-variant">{before}</p>
            </div>
            <div className="border-primary border-l-2 pl-4">
              <p className="text-label-caps text-primary mb-1">Après</p>
              <p className="text-on-surface-variant">{after}</p>
            </div>
          </div>
        </div>
      </Link>
    </GlassCard>
  );
}
