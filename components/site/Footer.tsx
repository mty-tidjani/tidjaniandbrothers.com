import Link from "next/link";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import { NAV_LINKS, isNavGroup, type NavLeaf } from "@/lib/constants";
import { Logo } from "@/components/site/Logo";

const FOOTER_LINKS: NavLeaf[] = [
  ...NAV_LINKS.flatMap((entry) => (isNavGroup(entry) ? entry.children : [entry])),
  { href: "/demande-devis", label: "Demander un devis" },
];

type FooterProps = {
  phone: string;
  email: string;
  address: string;
  facebookUrl?: string | null;
};

export function Footer({ phone, email, address, facebookUrl }: FooterProps) {
  return (
    <footer className="border-glass-stroke bg-surface-container-lowest pt-section-gap-mobile w-full border-t pb-8">
      <div className="container-max gap-gutter px-margin-mobile md:px-gutter grid grid-cols-1 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="mb-2 flex items-center gap-3">
            <Logo size={32} />
            <h2 className="text-headline-sm text-on-surface font-bold">
              Tidjani & Brothers
            </h2>
          </div>
          <p className="text-body-lg text-primary">We build robust IT solutions</p>
        </div>

        <nav
          className="flex flex-col gap-2 md:col-span-1"
          aria-label="Liens rapides"
        >
          <span className="text-label-caps text-primary mb-1">Navigation</span>
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-on-surface-variant hover:text-primary transition-colors hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 md:col-span-1">
          <span className="text-label-caps text-primary mb-1">Contact</span>
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="text-on-surface-variant hover:text-primary flex items-center gap-2"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            {phone}
          </a>
          <a
            href={`mailto:${email}`}
            className="text-on-surface-variant hover:text-primary flex items-center gap-2"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            {email}
          </a>
          <span className="text-on-surface-variant flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {address}
          </span>
        </div>

        <div className="flex flex-col gap-2 md:col-span-1">
          <span className="text-label-caps text-primary mb-1">Suivez-nous</span>
          {facebookUrl ? (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-primary flex items-center gap-2"
            >
              <Facebook className="h-4 w-4 shrink-0" aria-hidden="true" />
              Facebook
            </a>
          ) : null}
        </div>
      </div>

      <div className="container-max mt-stack-lg border-glass-stroke/50 px-margin-mobile md:px-gutter border-t pt-8">
        <p className="text-on-surface-variant text-sm">
          © {new Date().getFullYear()} Tidjani And Brothers SARL, all rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
