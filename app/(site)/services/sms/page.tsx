import type { Metadata } from "next";
import {
  BadgeCheck,
  Bell,
  CalendarClock,
  Code2,
  History,
  KeyRound,
  LogIn,
  Megaphone,
  Send,
  ShieldCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PricingTier } from "@/components/site/PricingTier";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicSmsPackages } from "@/lib/data/sms-portal";
import { getCompanySettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/seo";
import { getServiceJsonLd } from "@/lib/seo/service";

const SERVICE_DESCRIPTION =
  "Envoyez des SMS professionnels vers MTN et Orange Cameroun avec votre propre nom d'expéditeur : codes de vérification, rappels, notifications et promotions, depuis notre espace web ou par API. Crédits prépayés sans expiration.";

export const metadata: Metadata = buildMetadata({
  title: "SMS professionnels",
  description: SERVICE_DESCRIPTION,
  path: "/services/sms",
});

const USE_CASES = [
  {
    icon: ShieldCheck,
    title: "Codes de vérification",
    description: "Connexion, validation de compte ou de paiement (OTP).",
  },
  {
    icon: CalendarClock,
    title: "Rappels",
    description: "Rendez-vous, échéances, livraisons : moins d'oublis.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Commande confirmée, colis expédié, facture disponible.",
  },
  {
    icon: Megaphone,
    title: "Promotions",
    description: "Offres et annonces envoyées à vos clients en un clic.",
  },
];

const FEATURES = [
  {
    icon: BadgeCheck,
    label: "Votre nom d'expéditeur à la place d'un numéro",
  },
  { icon: Send, label: "Envoi depuis le web, jusqu'à 300 numéros à la fois" },
  { icon: Code2, label: "API HTTP simple pour vos logiciels et sites" },
  { icon: History, label: "Historique complet et export CSV" },
  { icon: Wallet, label: "Crédits prépayés, sans date d'expiration" },
  {
    icon: KeyRound,
    label: "Clés API gérées par vous, révocables à tout moment",
  },
];

const STEPS = [
  {
    title: "Créez votre compte",
    description: "En deux minutes, depuis votre espace SMS.",
  },
  {
    title: "Demandez votre nom d'expéditeur",
    description: "Le nom de votre entreprise ou marque, validé par nos soins.",
  },
  {
    title: "Rechargez",
    description:
      "Choisissez un forfait et payez par Mobile Money ou virement : votre solde est crédité dès validation.",
  },
  {
    title: "Envoyez",
    description: "Depuis votre tableau de bord ou via notre API.",
  },
];

const FAQ = [
  {
    q: "Qu'est-ce qu'un crédit\u00a0?",
    a: "1 crédit = 1 SMS vers un numéro MTN ou Orange au Cameroun. Un SMS contient jusqu'à 160 caractères. Un message plus long, ou contenant certains accents (ê, ç…) ou des emojis, compte plusieurs SMS : le compteur de l'espace web vous l'indique avant l'envoi.",
  },
  {
    q: "Mes crédits expirent-ils\u00a0?",
    a: "Non. Les crédits achetés restent sur votre compte jusqu'à leur utilisation.",
  },
  {
    q: "Que se passe-t-il si un envoi échoue\u00a0?",
    a: "Si un envoi est refusé au moment de sa transmission (numéro invalide, réseau non pris en charge…), les crédits correspondants vous sont automatiquement remboursés. Le détail de chaque envoi est visible dans votre historique.",
  },
  {
    q: "Comment payer\u00a0?",
    a: "Par Mobile Money (MTN MoMo, Orange Money) ou par virement. Envoyez-nous la référence du paiement depuis votre espace : nous créditons votre compte dès réception.",
  },
];

export default async function SmsServicePage() {
  const [packages, settings] = await Promise.all([
    getPublicSmsPackages(),
    getCompanySettings(),
  ]);
  const fmt = new Intl.NumberFormat("fr-FR");
  const cheapest = packages.length
    ? Math.min(...packages.map((p) => p.priceFcfa / p.credits))
    : null;

  return (
    <>
      <JsonLd
        data={getServiceJsonLd({
          name: "SMS professionnels",
          description: SERVICE_DESCRIPTION,
        })}
      />

      <section className="container-max px-margin-mobile pb-section-gap-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop text-center">
        <h1 className="text-display mb-stack-md text-on-surface">
          Des SMS à <span className="text-primary">votre nom</span>
        </h1>
        <p className="mb-stack-lg text-body-lg text-on-surface-variant mx-auto max-w-3xl">
          Envoyez codes de vérification, rappels, notifications et promotions à
          vos clients sur MTN et Orange Cameroun. Vos destinataires voient le
          nom de votre entreprise, pas un numéro inconnu.
          {cheapest ? (
            <>
              {" "}
              À partir de{" "}
              <strong className="text-on-surface">
                {fmt.format(Math.ceil(cheapest))} FCFA
              </strong>{" "}
              par SMS.
            </>
          ) : null}
        </p>
        <div className="mt-stack-lg flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href="/sms/inscription" size="lg">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            Créer un compte
          </Button>
          <Button href="/sms/connexion" variant="secondary" size="lg">
            <LogIn className="h-5 w-5" aria-hidden="true" />
            Espace SMS — Se connecter
          </Button>
        </div>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
          Pour quoi faire&nbsp;?
        </h2>
        <div className="gap-gutter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="glass-card glow-hover rounded-xl p-6">
              <Icon className="text-primary mb-4 h-8 w-8" aria-hidden="true" />
              <h3 className="text-headline-sm text-on-surface mb-2">{title}</h3>
              <p className="text-on-surface-variant text-sm">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {packages.length > 0 ? (
        <section
          id="tarifs-sms"
          className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop scroll-mt-28"
        >
          <h2 className="text-headline-md text-on-surface mb-2 text-center">
            Tarifs
          </h2>
          <p className="mb-stack-lg text-on-surface-variant text-center">
            Forfaits prépayés · 1 crédit = 1 SMS vers MTN ou Orange Cameroun
          </p>
          <div
            className={`gap-stack-lg md:gap-gutter grid grid-cols-1 items-center ${
              packages.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"
            }`}
          >
            {packages.map((pkg, index) => (
              <PricingTier
                key={pkg.id}
                name={pkg.name}
                priceMin={pkg.priceFcfa}
                priceMax={null}
                priceLabel={fmt.format(pkg.priceFcfa)}
                maxUsers={`${fmt.format(pkg.credits)} SMS`}
                features={[
                  `${fmt.format(Math.round(pkg.priceFcfa / pkg.credits))} FCFA par SMS`,
                  "Votre nom d'expéditeur",
                  "Espace web + API",
                  "Crédits sans expiration",
                ]}
                featured={packages.length >= 3 && index === 1}
              />
            ))}
          </div>
          <div className="mt-stack-lg border-glass-stroke bg-surface-container-low flex flex-col items-center justify-between gap-4 rounded-lg border p-6 md:flex-row">
            <div>
              <h3 className="text-headline-sm text-on-surface">Gros volumes</h3>
              <p className="text-on-surface-variant text-sm">
                Plus de {fmt.format(packages[packages.length - 1].credits)} SMS
                par mois&nbsp;? Parlons d&rsquo;un tarif dédié.
              </p>
            </div>
            <Button href="/contact" variant="secondary">
              Nous contacter
            </Button>
          </div>
        </section>
      ) : null}

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
          Inclus dans chaque forfait
        </h2>
        <div className="gap-stack-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="border-glass-stroke bg-surface-container-low text-on-surface-variant flex items-center gap-3 rounded-lg border p-4"
            >
              <Icon
                className="text-primary h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              {label}
            </div>
          ))}
        </div>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
          Comment ça marche
        </h2>
        <ol className="gap-gutter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="glass-card rounded-xl p-6">
              <span className="bg-primary-container text-on-accent mb-4 flex h-9 w-9 items-center justify-center rounded-full font-bold">
                {index + 1}
              </span>
              <h3 className="text-headline-sm text-on-surface mb-2">
                {step.title}
              </h3>
              <p className="text-on-surface-variant text-sm">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-max px-margin-mobile pb-section-gap-mobile md:px-gutter md:pb-section-gap-desktop">
        <h2 className="mb-stack-lg text-headline-md text-on-surface text-center">
          Questions fréquentes
        </h2>
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="glass-card group rounded-xl px-6 py-4">
              <summary className="text-on-surface cursor-pointer font-bold">
                {q}
              </summary>
              <p className="text-on-surface-variant mt-3 text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container-max px-margin-mobile md:px-gutter">
        <div className="glass-card gap-stack-md flex flex-col items-center rounded-xl p-10 text-center">
          <h2 className="text-headline-md text-on-surface">
            Prêt à envoyer vos premiers SMS&nbsp;?
          </h2>
          <p className="text-on-surface-variant max-w-2xl">
            Créez votre compte et demandez votre nom d&rsquo;expéditeur dès
            aujourd&rsquo;hui. Une question&nbsp;? Appelez-nous au{" "}
            <a
              href={`tel:${settings.phone.replace(/\s+/g, "")}`}
              className="text-primary hover:underline"
            >
              {settings.phone}
            </a>
            .
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button href="/sms/inscription" size="lg">
              Créer un compte
            </Button>
            <Button href="/sms/connexion" variant="secondary" size="lg">
              Se connecter
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
