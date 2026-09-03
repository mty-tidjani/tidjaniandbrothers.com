import type { Metadata } from "next";
import {
  Rocket,
  Wrench,
  Receipt,
  Boxes,
  ShoppingCart,
  Calculator,
  Users,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { PricingTier } from "@/components/site/PricingTier";
import { CTASection } from "@/components/site/CTASection";
import { getServiceTiers, getMaintenancePlan } from "@/lib/data/services";
import { getCompanySettings } from "@/lib/data/settings";
import { formatPriceRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "Services Odoo ERP",
  description:
    "Installation et support Odoo ERP pour PME camerounaises : facturation, stock, ventes, comptabilité, CRM et intégration mobile money (MTN MoMo, Orange Money).",
};

const MODULES = [
  { icon: Receipt, label: "Facturation" },
  { icon: Boxes, label: "Gestion des stocks" },
  { icon: ShoppingCart, label: "Ventes" },
  { icon: Calculator, label: "Comptabilité" },
  { icon: Users, label: "CRM" },
  { icon: Smartphone, label: "Paiement mobile" },
];

export default async function OdooServicesPage() {
  const [tiers, maintenance, settings] = await Promise.all([
    getServiceTiers(),
    getMaintenancePlan(),
    getCompanySettings(),
  ]);

  return (
    <>
      <section className="container-max px-margin-mobile pb-section-gap-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop text-center">
        <h1 className="text-display mb-stack-md text-on-surface">
          Solutions <span className="text-primary">Odoo</span> sur-mesure
        </h1>
        <p className="mb-stack-lg text-body-lg text-on-surface-variant mx-auto max-w-3xl">
          Chez Tidjani & Brothers, nous accompagnons les entreprises
          camerounaises dans leur transition vers une gestion moderne et
          centralisée grâce à Odoo, la solution ERP tout-en-un pour PME. Vous
          démarrez de zéro&nbsp;? Nous installons et configurons votre solution
          Odoo clé en main. Vous avez déjà une installation existante&nbsp;?
          Nous intervenons en support, optimisation et maintenance.
        </p>
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
        <p className="text-on-surface-variant mt-stack-md text-center">
          Besoin uniquement d&rsquo;une formation&nbsp;?{" "}
          <Link
            href="/services/formation"
            className="text-primary hover:underline"
          >
            Voir notre page dédiée →
          </Link>
        </p>
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

      {tiers.length > 0 ? (
        <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
          <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
            Investissement
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

      <CTASection
        title="Discutons de votre projet Odoo"
        description="Réservez un audit gratuit de 30 minutes, sans engagement."
        phone={settings.phone}
        email={settings.email}
      />
    </>
  );
}
