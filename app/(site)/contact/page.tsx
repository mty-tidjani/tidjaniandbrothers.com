import type { Metadata } from "next";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Button } from "@/components/ui/Button";
import { getCompanySettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Contactez Tidjani And Brothers à Yaoundé pour votre projet Odoo ERP ou site web, ou réservez directement un audit gratuit de 30 minutes.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getCompanySettings();

  return (
    <section className="container-max px-margin-mobile md:px-gutter">
      <div className="mb-section-gap-mobile text-center">
        <h1 className="text-display mb-stack-sm text-on-surface">
          Parlons de <span className="text-primary">votre projet</span>
        </h1>
        <p className="text-body-lg text-on-surface-variant mx-auto max-w-2xl">
          Une question, un projet Odoo ou web&nbsp;? Écrivez-nous ou réservez
          directement un audit gratuit.
        </p>
      </div>

      <div className="gap-gutter pb-section-gap-desktop grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        <div className="gap-gutter flex flex-col lg:col-span-5">
          <div className="glass-card rounded-xl p-6 md:p-8">
            <h3 className="mb-stack-md text-headline-sm text-primary">
              Nos coordonnées
            </h3>
            <ul className="space-y-stack-md">
              <li className="flex items-start gap-4">
                <MapPin
                  className="text-primary mt-1 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-on-surface font-bold">Yaoundé, Cameroun</p>
                  <p className="text-on-surface-variant">{settings.address}</p>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <Phone
                  className="text-primary h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                  className="text-on-surface hover:text-primary"
                >
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-4">
                <Mail
                  className="text-primary h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${settings.email}`}
                  className="text-on-surface hover:text-primary"
                >
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="glass-card relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl p-6 text-center md:p-8">
            <ShieldCheck
              className="text-primary mb-4 h-10 w-10"
              aria-hidden="true"
            />
            <h3 className="text-headline-sm text-on-surface mb-2">
              Audit stratégique
            </h3>
            <p className="mb-stack-lg text-on-surface-variant">
              Évaluez la solidité de votre infrastructure actuelle avec nos
              experts.
            </p>
            <Button href="/reserver-audit" size="lg" className="w-full">
              Réserver un audit gratuit de 30 minutes
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
