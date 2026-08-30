import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CTASection } from "@/components/site/CTASection";
import { getPublishedCaseStudyBySlug } from "@/lib/data/portfolio";
import { getCompanySettings } from "@/lib/data/settings";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);
  if (!study) return {};
  return {
    title: study.sector,
    description: study.after,
  };
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [study, settings] = await Promise.all([
    getPublishedCaseStudyBySlug(slug),
    getCompanySettings(),
  ]);

  if (!study) notFound();

  return (
    <>
      <article className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter">
        <Link
          href="/portfolio"
          className="mb-stack-md text-label-caps text-primary inline-flex items-center gap-2 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour au portfolio
        </Link>
        <h1 className="text-display mb-stack-lg text-on-surface">
          {study.sector}
        </h1>

        <div className="gap-gutter grid grid-cols-1 md:grid-cols-2">
          <div className="glass-card border-error/50 rounded-xl border-l-4 p-8">
            <p className="text-label-caps text-error mb-2">Avant</p>
            <p className="text-on-surface-variant">{study.before}</p>
          </div>
          <div className="glass-card border-primary rounded-xl border-l-4 p-8">
            <p className="text-label-caps text-primary mb-2">Après</p>
            <p className="text-on-surface-variant">{study.after}</p>
          </div>
        </div>

        {study.resultMetric ? (
          <div className="mt-stack-lg border-glass-stroke bg-surface-container-low text-headline-sm text-primary rounded-lg border p-6 text-center">
            {study.resultMetric}
          </div>
        ) : null}
      </article>

      <CTASection
        title="Un résultat similaire pour votre entreprise ?"
        description="Réservez un audit gratuit pour évaluer votre situation."
        phone={settings.phone}
        email={settings.email}
      />
    </>
  );
}
