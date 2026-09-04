import type { Metadata } from "next";
import {
  GraduationCap,
  RefreshCw,
  Award,
  MapPin,
  Users,
  Globe,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ServiceCard } from "@/components/site/ServiceCard";
import { PricingTier } from "@/components/site/PricingTier";
import { CTASection } from "@/components/site/CTASection";
import { getCompanySettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getServiceJsonLd } from "@/lib/seo/service";

const SERVICE_DESCRIPTION =
  "Formation Odoo pour votre équipe : prise en main, mise à niveau ou formation avancée, sur site ou à distance, en français ou en anglais.";

export const metadata: Metadata = buildMetadata({
  title: "Formation Odoo",
  description: SERVICE_DESCRIPTION,
  path: "/services/formation",
});

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

export default async function FormationPage() {
  const settings = await getCompanySettings();

  return (
    <>
      <JsonLd
        data={getServiceJsonLd({
          name: "Formation Odoo",
          description: SERVICE_DESCRIPTION,
        })}
      />
      <section className="container-max px-margin-mobile pb-section-gap-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop text-center">
        <h1 className="text-display mb-stack-md text-on-surface">
          Formation Odoo pour <span className="text-primary">votre équipe</span>
        </h1>
        <p className="mb-stack-lg text-body-lg text-on-surface-variant mx-auto max-w-3xl">
          Que votre équipe démarre de zéro ou utilise déjà Odoo, nous formons
          vos collaborateurs à l&rsquo;utiliser efficacement au quotidien.
        </p>
        <Button href="/reserver-audit" size="lg">
          Réserver une session de formation
        </Button>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <div className="glass-card rounded-xl p-8">
          <p className="text-on-surface-variant">
            La formation n&rsquo;est pas juste une étape de notre installation —
            c&rsquo;est un service à part entière. Vous avez déjà Odoo mais
            votre équipe n&rsquo;est pas à l&rsquo;aise avec
            l&rsquo;outil&nbsp;? Vous avez du nouveau personnel à former&nbsp;?
            Nous intervenons aussi bien pour des clients Tidjani &amp; Brothers
            que pour des entreprises ayant une installation Odoo existante, peu
            importe qui l&rsquo;a mise en place.
          </p>
        </div>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
          Formats de formation
        </h2>
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
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <div className="gap-stack-md grid grid-cols-1 md:grid-cols-3">
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

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
          Tarifs
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
        title="Discutons de vos besoins de formation"
        description="Réservez un audit gratuit de 30 minutes pour définir le format de formation adapté à votre équipe."
        phone={settings.phone}
        email={settings.email}
      />
    </>
  );
}
