import type { Metadata } from "next";
import { CaseStudyCard } from "@/components/site/CaseStudyCard";
import { getPublishedCaseStudies } from "@/lib/data/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Études de cas réelles de transformations Odoo ERP pour des PME camerounaises.",
};

export default async function PortfolioPage() {
  const caseStudies = await getPublishedCaseStudies();

  return (
    <section className="container-max px-margin-mobile md:px-gutter">
      <div className="mb-section-gap-mobile text-center">
        <h1 className="text-display mb-stack-sm text-on-surface">
          Nos <span className="text-primary">réalisations</span>
        </h1>
        <p className="text-body-lg text-on-surface-variant mx-auto max-w-2xl">
          Des transformations concrètes pour des PME d&rsquo;Afrique Centrale.
        </p>
      </div>

      {caseStudies.length === 0 ? (
        <p className="pb-section-gap-mobile text-on-surface-variant text-center">
          Aucune étude de cas publiée pour le moment.
        </p>
      ) : (
        <div className="gap-gutter pb-section-gap-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {caseStudies.map((study, index) => (
            <CaseStudyCard
              key={study.id}
              slug={study.slug}
              sector={study.sector}
              before={study.before}
              after={study.after}
              imagePath={study.imagePaths[0]}
              featured={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
