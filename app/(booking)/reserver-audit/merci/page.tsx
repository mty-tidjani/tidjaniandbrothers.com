import type { Metadata } from "next";
import { Facebook } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { getCompanySettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Demande envoyée",
  robots: { index: false },
};

type PageProps = { searchParams: Promise<{ phone?: string }> };

export default async function AuditConfirmationPage({
  searchParams,
}: PageProps) {
  const [{ phone }, settings] = await Promise.all([
    searchParams,
    getCompanySettings(),
  ]);

  return (
    <div className="w-full max-w-2xl text-center">
      <h1 className="text-display mb-stack-md text-on-surface">
        Merci&nbsp;! Votre demande a bien été reçue 🎉
      </h1>
      <p className="mb-section-gap-mobile text-body-lg text-on-surface-variant">
        Un membre de l&rsquo;équipe Tidjani & Brothers vous contactera sous 24h ouvrées
        {phone ? (
          <>
            {" "}
            au <span className="text-primary font-bold">{phone}</span>
          </>
        ) : null}{" "}
        pour planifier votre audit gratuit.
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
