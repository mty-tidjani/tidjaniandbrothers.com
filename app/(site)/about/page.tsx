import type { Metadata } from "next";
import { GraduationCap, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Fondée en 2019 à Yaoundé, Spartiat-AI a évolué du web design vers l'implémentation Odoo ERP pour PME camerounaises. We make IT for you.",
};

const TIMELINE = [
  {
    year: "2019",
    title: "Fondation à Yaoundé",
    description:
      "Spartiat-AI démarre comme agence de web design (alors Spartiat-IT), au service des entreprises locales.",
  },
  {
    year: "2023",
    title: "Le virage Odoo",
    description:
      "Face au besoin réel du terrain, l'équipe se spécialise dans l'implémentation et la maintenance Odoo ERP.",
  },
  {
    year: "2026",
    title: "Naissance de Spartiat-AI",
    description:
      "Rebranding et recentrage sur l'ERP pour PME locales, avec une approche bilingue et une vraie proximité client.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter text-center">
        <h1 className="text-display mb-stack-md text-on-surface">
          Une équipe qui reste <span className="text-primary">impliquée</span>
        </h1>
        <p className="text-body-lg text-on-surface-variant mx-auto max-w-2xl">
          De nos débuts en web design à notre spécialisation Odoo, notre mission
          n&rsquo;a pas changé&nbsp;: équiper les PME camerounaises
          d&rsquo;outils fiables, et rester à leurs côtés après
          l&rsquo;installation.
        </p>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-desktop md:px-gutter">
        <div className="space-y-stack-lg">
          {TIMELINE.map((item) => (
            <div
              key={item.year}
              className="border-glass-stroke grid grid-cols-1 gap-4 border-l-2 py-2 pl-6 md:grid-cols-[120px_1fr]"
            >
              <span className="text-headline-sm text-primary">{item.year}</span>
              <div>
                <h2 className="text-headline-sm text-on-surface mb-2">
                  {item.title}
                </h2>
                <p className="text-on-surface-variant">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-desktop md:px-gutter">
        <div className="mb-section-gap-mobile text-center">
          <h2 className="text-headline-md text-on-surface mb-2">
            Notre philosophie
          </h2>
          <p className="text-headline-sm text-primary italic">
            &laquo; We make IT for you &raquo;
          </p>
        </div>
        <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
          <div className="glass-card glow-hover rounded-xl p-8">
            <GraduationCap
              className="text-primary mb-4 h-8 w-8"
              aria-hidden="true"
            />
            <h3 className="text-headline-sm text-on-surface mb-2">
              Formation systématique
            </h3>
            <p className="text-on-surface-variant">
              Nous ne livrons pas juste un logiciel&nbsp;: nous formons vos
              équipes pour une adoption réelle et un retour sur investissement
              immédiat.
            </p>
          </div>
          <div className="glass-card glow-hover rounded-xl p-8">
            <HeartHandshake
              className="text-primary mb-4 h-8 w-8"
              aria-hidden="true"
            />
            <h3 className="text-headline-sm text-on-surface mb-2">
              Support qui dure
            </h3>
            <p className="text-on-surface-variant">
              Une équipe locale et joignable, disponible bien après la mise en
              production — pas un prestataire qui disparaît après paiement.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
