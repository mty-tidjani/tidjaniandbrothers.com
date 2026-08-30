import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";

type CTASectionProps = {
  title: string;
  description: string;
  phone: string;
  email: string;
};

export function CTASection({
  title,
  description,
  phone,
  email,
}: CTASectionProps) {
  return (
    <section className="container-max px-margin-mobile pt-section-gap-mobile md:px-gutter md:pt-section-gap-desktop">
      <div className="glass-card gap-stack-md flex flex-col items-center rounded-xl p-10 text-center">
        <h2 className="text-headline-md text-on-surface">{title}</h2>
        <p className="text-on-surface-variant max-w-2xl">{description}</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button href="/reserver-audit" size="lg">
            Réserver un audit gratuit
          </Button>
          <Button href="/contact" variant="secondary" size="lg">
            Nous contacter
          </Button>
        </div>
        <div className="text-on-surface-variant mt-4 flex flex-col items-center gap-2 sm:flex-row sm:gap-8">
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="hover:text-primary flex items-center gap-2"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {phone}
          </a>
          <a
            href={`mailto:${email}`}
            className="hover:text-primary flex items-center gap-2"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {email}
          </a>
        </div>
      </div>
    </section>
  );
}
