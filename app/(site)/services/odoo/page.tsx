import type { Metadata } from "next";
import {
  Rocket,
  Wrench,
  Receipt,
  Boxes,
  ShoppingCart,
  Calculator,
  Users,
  UserCog,
  GraduationCap,
  RefreshCw,
  Award,
  MapPin,
  Globe,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ServiceCard } from "@/components/site/ServiceCard";
import { PricingTier } from "@/components/site/PricingTier";
import { CTASection } from "@/components/site/CTASection";
import { getServiceTiers, getMaintenancePlan } from "@/lib/data/services";
import { getCompanySettings } from "@/lib/data/settings";
import { formatPriceRange } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getServiceJsonLd } from "@/lib/seo/service";

const SERVICE_DESCRIPTION =
  "Installation, support et formation Odoo ERP pour PME camerounaises : facturation, stock, ventes, comptabilité, CRM, intégration mobile money (MTN MoMo, Orange Money) et formation de vos équipes.";

export const metadata: Metadata = buildMetadata({
  title: "Services Odoo ERP",
  description: SERVICE_DESCRIPTION,
  path: "/services/odoo",
});

const MODULES = [
  { icon: Receipt, label: "Facturation" },
  { icon: Boxes, label: "Gestion des stocks" },
  { icon: ShoppingCart, label: "Ventes" },
  { icon: Calculator, label: "Comptabilité" },
  { icon: Users, label: "CRM" },
  { icon: UserCog, label: "Ressources Humaines" },
];

const FORMATS = [
  {
    icon: GraduationCap,
    title: "Formation initiale",
    description:
      "Incluse dans chaque projet d'installation : prise en main complète des modules déployés (facturation, stock, ventes, comptabilité).",
  },
  {
    icon: RefreshCw,
    title: "Formation continue",
    description:
      "Sessions de mise à niveau pour vos nouveaux employés ou pour approfondir des fonctionnalités spécifiques.",
  },
  {
    icon: Award,
    title: "Formation avancée / utilisateurs clés",
    description:
      "Pour les responsables qui doivent maîtriser la configuration, les rapports personnalisés et l'administration du système.",
  },
];

const FORMAT_DETAILS = [
  { icon: MapPin, label: "Sur site (Yaoundé et environs) ou à distance" },
  { icon: Users, label: "En groupe ou en one-to-one" },
  { icon: Globe, label: "En français ou en anglais" },
];

export default async function OdooServicesPage() {
  const [tiers, maintenance, settings] = await Promise.all([
    getServiceTiers(),
    getMaintenancePlan(),
    getCompanySettings(),
  ]);

  return (
    <>
      <JsonLd
        data={getServiceJsonLd({
          name: "Services Odoo ERP",
          description: SERVICE_DESCRIPTION,
        })}
      />
      <section className="container-max px-margin-mobile pb-section-gap-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop text-center">
        <h1 className="text-display mb-stack-md text-on-surface">
          Solutions <span className="text-primary">Odoo</span> sur-mesure
        </h1>
        <p className="mb-stack-lg text-body-lg text-on-surface-variant mx-auto max-w-3xl">
          Chez Tidjani And Brothers, nous accompagnons les entreprises
          camerounaises dans leur transition vers une gestion moderne et
          centralisée grâce à Odoo, la solution ERP tout-en-un pour PME. Vous
          démarrez de zéro&nbsp;? Nous installons et configurons votre solution
          Odoo clé en main. Vous avez déjà une installation existante&nbsp;?
          Nous intervenons en support, optimisation, maintenance et formation
          de vos équipes.
        </p>
        <div className="mt-stack-lg flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href="/demande-devis" size="lg">
            Demander un devis
          </Button>
          <Button href="/reserver-audit" variant="secondary" size="lg">
            Réserver un audit gratuit
          </Button>
        </div>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <div className="gap-gutter grid grid-cols-1 md:grid-cols-2">
          <div className="glass-card glow-hover rounded-xl p-8">
            <Rocket className="text-primary mb-4 h-8 w-8" aria-hidden="true" />
            <h2 className="text-headline-md text-on-surface mb-2">
              Nouvelle installation
            </h2>
            <p className="text-on-surface-variant">
              Déploiement complet et personnalisé d&rsquo;Odoo pour votre
              entreprise, de l&rsquo;analyse des besoins à la mise en
              production, avec formation de vos équipes à la clé.
            </p>
          </div>
          <div className="glass-card glow-hover rounded-xl p-8">
            <Wrench className="text-primary mb-4 h-8 w-8" aria-hidden="true" />
            <h2 className="text-headline-md text-on-surface mb-2">
              Support &amp; maintenance
            </h2>
            <p className="text-on-surface-variant">
              Correction de bugs, mises à jour, ajout de nouveaux modules,
              intégrations (paiement mobile, e-commerce) et assistance continue
              pour que votre système reste fiable et évolutif.
            </p>
          </div>
        </div>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
          Modules clés
        </h2>
        <div className="gap-stack-md grid grid-cols-2 md:grid-cols-3">
          {MODULES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="border-glass-stroke bg-surface-container-low text-on-surface-variant flex items-center gap-3 rounded-lg border p-4"
            >
              <Icon className="text-primary h-5 w-5" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
          Formation Odoo
        </h2>
        <div className="glass-card rounded-xl p-8 mb-stack-lg">
          <p className="text-on-surface-variant">
            La formation n&rsquo;est pas juste une étape de notre installation
            — c&rsquo;est un service à part entière. Vous avez déjà Odoo mais
            votre équipe n&rsquo;est pas à l&rsquo;aise avec
            l&rsquo;outil&nbsp;? Vous avez du nouveau personnel à
            former&nbsp;? Nous intervenons aussi bien pour des clients Tidjani
            &amp; Brothers que pour des entreprises ayant une installation
            Odoo existante, peu importe qui l&rsquo;a mise en place.
          </p>
        </div>
        <div className="gap-gutter grid grid-cols-1 md:grid-cols-3">
          {FORMATS.map((format) => (
            <ServiceCard
              key={format.title}
              icon={format.icon}
              title={format.title}
              description={format.description}
              href="/reserver-audit"
            />
          ))}
        </div>
        <div className="gap-stack-md mt-stack-lg grid grid-cols-1 md:grid-cols-3">
          {FORMAT_DETAILS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="border-glass-stroke bg-surface-container-low text-on-surface-variant flex items-center gap-3 rounded-lg border p-4"
            >
              <Icon className="text-primary h-5 w-5" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {tiers.length > 0 ? (
        <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
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

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
          Tarifs formation
        </h2>
        <div className="gap-stack-lg md:gap-gutter grid grid-cols-1 items-stretch md:grid-cols-2">
          <PricingTier
            name="Session ponctuelle"
            priceMin={50000}
            priceMax={null}
            features={[
              "Session adaptée aux besoins de votre équipe",
              "Sur site ou à distance",
              "En groupe ou en one-to-one",
              "Support de formation inclus",
            ]}
          />
          <div className="glass-card gap-stack-md flex h-full flex-col rounded-xl p-6">
            <h3 className="text-label-caps text-on-surface-variant">
              Forfait formation continue
            </h3>
            <div className="text-headline-sm text-on-surface">Sur devis</div>
            <p className="text-on-surface-variant text-sm">
              Facturation trimestrielle
            </p>
            <ul className="text-on-surface-variant flex-1 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check
                  className="text-primary h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                Sessions régulières pour vos nouveaux employés
              </li>
              <li className="flex items-center gap-2">
                <Check
                  className="text-primary h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                Approfondissement de fonctionnalités spécifiques
              </li>
              <li className="flex items-center gap-2">
                <Check
                  className="text-primary h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                Tarif ajusté au volume de sessions
              </li>
            </ul>
          </div>
        </div>
      </section>

      <CTASection
        title="Discutons de votre projet Odoo"
        description="Installation, support ou formation : réservez un audit gratuit de 30 minutes, sans engagement."
        phone={settings.phone}
        email={settings.email}
        extraCta={{ href: "/demande-devis", label: "Demander un devis" }}
      />
    </>
  );
}
