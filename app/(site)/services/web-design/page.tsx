import type { Metadata } from "next";
import { ShoppingCart, Store, GalleryHorizontal, Code2 } from "lucide-react";
import { CTASection } from "@/components/site/CTASection";
import { getCompanySettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Web Design",
  description:
    "Site vitrine, e-commerce ou portfolio, conçu par la même équipe que votre projet Odoo pour un seul point de contact et une expérience cohérente.",
};

const OFFERS = [
  {
    icon: ShoppingCart,
    title: "E-commerce (boutique en ligne)",
    description:
      "Boutique en ligne connectée à votre stock et votre comptabilité Odoo pour un suivi unifié des commandes.",
  },
  {
    icon: Store,
    title: "Site vitrine",
    description:
      "Une présence en ligne professionnelle qui présente votre activité et inspire confiance à vos clients.",
  },
  {
    icon: GalleryHorizontal,
    title: "Portfolio",
    description:
      "Une galerie soignée pour mettre en valeur vos réalisations, rapide à charger et facile à parcourir.",
  },
  {
    icon: Code2,
    title: "Site personnalisé",
    description:
      "Des applications web sur-mesure, connectées à votre base de données quand c'est nécessaire.",
  },
];

export default async function WebDesignServicesPage() {
  const settings = await getCompanySettings();

  return (
    <>
      <section className="container-max px-margin-mobile pb-section-gap-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop">
        <h1 className="text-display mb-stack-md text-on-surface">
          Web design, <span className="text-primary">unifié avec Odoo</span>
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Nous gérons votre projet web aux côtés de votre déploiement Odoo, avec
          une seule équipe et un seul point de contact — vos données restent
          cohérentes du site jusqu&rsquo;à la comptabilité.
        </p>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <div className="gap-gutter grid grid-cols-1 md:grid-cols-2">
          {OFFERS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="glass-card glow-hover rounded-xl p-8">
              <Icon className="text-primary mb-4 h-8 w-8" aria-hidden="true" />
              <h2 className="text-headline-sm text-on-surface mb-2">{title}</h2>
              <p className="text-on-surface-variant">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <CTASection
        title="Un projet web à démarrer ?"
        description="Parlons-en pendant votre audit gratuit, que ce soit lié à un projet Odoo ou non."
        phone={settings.phone}
        email={settings.email}
      />
    </>
  );
}
