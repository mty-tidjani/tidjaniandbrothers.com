import type { Metadata } from "next";
import { Facebook } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { getCompanySettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Demande de devis envoyée",
  robots: { index: false },
};

type PageProps = { searchParams: Promise<{ company?: string }> };

export default async function DevisConfirmationPage({
  searchParams,
}: PageProps) {
  const [{ company }, settings] = await Promise.all([
    searchParams,
    getCompanySettings(),
  ]);

  return (
    <div className="w-full max-w-2xl text-center">
      <h1 className="text-display mb-stack-md text-on-surface">
        Merci&nbsp;! Votre demande de devis a bien été reçue 🎉
      </h1>
      <p className="mb-section-gap-mobile text-body-lg text-on-surface-variant">
        Nous vous recontactons sous 48h avec une estimation détaillée
        {company ? (
          <>
            {" "}
            pour <span className="text-primary font-bold">{company}</span>
          </>
        ) : null}
        .
      </p>

      <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
        <GlassCard className="p-8 text-left">
          <h2 className="text-headline-sm text-on-surface mb-2">
            En attendant
          </h2>
          <p className="mb-stack-md text-on-surface-variant">
            Découvrez comment nous avons aidé d&rsquo;autres entreprises.
          </p>
          <Button href="/portfolio" variant="secondary">
            Voir le portfolio
          </Button>
        </GlassCard>

        <GlassCard className="p-8 text-left">
          <h2 className="text-headline-sm text-on-surface mb-2">
            Restons en contact
          </h2>
          {settings.facebookUrl ? (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-primary flex items-center gap-2"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
              Suivez-nous sur Facebook
            </a>
          ) : null}
        </GlassCard>
      </div>
    </div>
  );
}
