import type { Metadata } from "next";
import { Globe, MapPin, Tag } from "lucide-react";
import { Search, FileWarning, AlertTriangle } from "lucide-react";
import { Blocks, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TrustBadge } from "@/components/site/TrustBadge";
import { ServiceCard } from "@/components/site/ServiceCard";
import { CaseStudyCard } from "@/components/site/CaseStudyCard";
import { CTASection } from "@/components/site/CTASection";
import { getCompanySettings } from "@/lib/data/settings";
import { getPublishedCaseStudies } from "@/lib/data/portfolio";
import { buildMetadata } from "@/lib/seo";
import { getMaintenancePlan, getServiceTiers } from "@/lib/data/services";
import { PricingTier } from "@/components/site/PricingTier";
import { formatPriceRange } from "@/lib/format";

export const metadata: Metadata = buildMetadata({
  title: "Accueil",
  description:
    "Votre entreprise mérite mieux qu'Excel. Tidjani And Brothers déploie Odoo ERP sur-mesure pour les PME camerounaises : facturation, stock, ventes, comptabilité.",
  path: "/",
});

const PAIN_POINTS = [
  {
    icon: Search,
    title: "Temps perdu",
    description:
      "Des heures perdues chaque semaine à chercher une facture dans plusieurs fichiers Excel, au lieu d'analyser vos performances.",
  },
  {
    icon: FileWarning,
    title: "Opacité des stocks",
    description:
      "Impossible de connaître vos niveaux de stock en temps réel. Risque constant de rupture ou de sur-stockage coûteux.",
  },
  {
    icon: AlertTriangle,
    title: "Chiffres qui ne collent pas",
    description:
      "Les ventes en caisse ne correspondent jamais aux entrées comptables. La double saisie manuelle crée des erreurs.",
  },
];

const PROCESS_STEPS = [
  {
    title: "Audit gratuit",
    description: "On évalue vos besoins réels en 30 minutes.",
  },
  {
    title: "Configuration sur-mesure",
    description: "Odoo configuré pour votre activité, pas l'inverse.",
  },
  {
    title: "Formation de l'équipe",
    description: "Vos équipes sont autonomes dès le lancement.",
  },
  {
    title: "Support continu",
    description:
      "Une équipe locale joignable, pas un prestataire qui disparaît.",
  },
];

export default async function HomePage() {
  const [tiers, maintenance, settings, caseStudies] = await Promise.all([
    getServiceTiers(),
    getMaintenancePlan(),
    getCompanySettings(),
    getPublishedCaseStudies(),
  ]);
  const featuredCaseStudy = caseStudies[0];

  return (
    <>
      <section className="container-max gap-gutter px-margin-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop grid grid-cols-1 items-center md:grid-cols-12">
        <div className="md:col-span-8">
          <h1 className="text-display mb-stack-md text-on-surface">
            Votre entreprise mérite <br />
            <span className="text-primary">mieux qu&rsquo;Excel.</span>
          </h1>
          <p className="mb-stack-lg text-body-lg text-on-surface-variant max-w-2xl">
            Déployez la puissance de l&rsquo;ERP Odoo : facturation, stock,
            ventes et comptabilité réunis dans un seul système, configuré
            sur-mesure pour votre PME camerounaise.
          </p>
          <div className="flex flex-col gap-4 mb-6 sm:flex-row">
            <Button href="/reserver-audit" size="lg">
              Réserver un audit gratuit
            </Button>
            <Button href="/demande-devis" variant="secondary" size="lg">
              Demander un devis
            </Button>
            <Button href="#tarifs" variant="tertiary" size="lg">
              Voir les tarifs
            </Button>
          </div>
        </div>
      </section>

      <section className="border-glass-stroke bg-surface-container/30 border-y py-8">
        <div className="container-max px-margin-mobile md:px-gutter flex flex-wrap justify-center gap-8 md:justify-between md:gap-16">
          <TrustBadge icon={Globe} label="Livraison bilingue FR/EN" />
          <TrustBadge icon={MapPin} label="Équipe locale à Yaoundé" />
          <TrustBadge icon={Tag} label="Tarifs fixes et transparents" />
        </div>
      </section>

      <section className="container-max px-margin-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop">
        <div className="mb-16 text-center">
          <h2 className="text-headline-md text-on-surface mb-4">
            3 signes que vous avez dépassé Excel
          </h2>
          <p className="text-on-surface-variant mx-auto max-w-2xl">
            La gestion manuelle freine votre croissance. Reconnaissez-vous ces
            symptômes dans vos opérations quotidiennes&nbsp;?
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PAIN_POINTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="glass-card glow-hover rounded-xl p-8">
              <div className="border-glass-stroke bg-surface-container mb-6 flex h-12 w-12 items-center justify-center rounded-lg border">
                <Icon className="text-primary h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-headline-sm text-on-surface mb-3">{title}</h3>
              <p className="text-on-surface-variant">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* <section className="container-max px-margin-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop">
        <div className="gap-gutter grid grid-cols-1 md:grid-cols-2">
          <ServiceCard
            icon={Blocks}
            title="Odoo ERP"
            description="Installation clé en main ou support d'une installation existante : facturation, stock, ventes, comptabilité, CRM et paiement mobile."
            href="/services/odoo"
            tag="Service principal"
          />
          <ServiceCard
            icon={LayoutTemplate}
            title="Web Design"
            description="Site vitrine, e-commerce ou portfolio, géré par la même équipe que votre projet Odoo pour une expérience cohérente."
            href="/services/web-design"
          />
        </div>
      </section> */}

      <section className="container-max px-margin-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop">
        <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
          Comment ça marche
        </h2>
        <div className="gap-gutter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="bg-primary-container text-on-accent mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
                {index + 1}
              </div>
              <h3 className="text-headline-sm text-on-surface mb-2">
                {step.title}
              </h3>
              <p className="text-on-surface-variant text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {tiers.length > 0 ? (
        <section
          id="tarifs"
          className="container-max px-margin-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop scroll-mt-24"
        >
          <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
            Grille Tarifaire
          </h2>
          <div className="gap-stack-lg md:gap-gutter grid grid-cols-1 items-center md:grid-cols-3">
            {tiers.map((tier) => (
              <PricingTier
                key={tier.id}
                name={tier.name}
                priceMin={tier.priceMin}
                priceMax={tier.priceMax}
                features={tier.features}
                maxUsers={tier.maxUsers}
                featured={tier.name.toLowerCase().includes("standard")}
              />
            ))}
          </div>

          {maintenance ? (
            <div className="mt-stack-lg border-glass-stroke bg-surface-container-low flex flex-col items-center justify-between gap-4 rounded-lg border p-6 md:flex-row">
              <div>
                <h3 className="text-headline-sm text-on-surface">
                  {maintenance.name}
                </h3>
                <p className="text-on-surface-variant text-sm">
                  Assistance continue pour votre sérénité.
                </p>
              </div>
              <div className="text-headline-sm text-primary">
                {formatPriceRange(maintenance.priceMin, maintenance.priceMax)}{" "}
                <span className="text-on-surface-variant text-sm font-normal">
                  FCFA / mois
                </span>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* {featuredCaseStudy ? (
        <section className="container-max px-margin-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop">
          <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
            Ils nous font confiance
          </h2>
          <div className="grid grid-cols-1">
            <CaseStudyCard
              slug={featuredCaseStudy.slug}
              sector={featuredCaseStudy.sector}
              before={featuredCaseStudy.before}
              after={featuredCaseStudy.after}
              imagePath={featuredCaseStudy.imagePaths[0]}
              featured
            />
          </div>
        </section>
      ) : null} */}

      <CTASection
        title="Prêt à moderniser votre gestion ?"
        description="Un membre de l'équipe Tidjani And Brothers vous répond sous 24h ouvrées."
        phone={settings.phone}
        email={settings.email}
      />
    </>
  );
}
