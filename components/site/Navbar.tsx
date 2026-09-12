"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { LanguageToggle } from "@/components/site/LanguageToggle";
import { Logo } from "@/components/site/Logo";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation. Adjusted during render (React's
  // documented escape hatch for resetting state on prop changes) rather
  // than in an effect, to avoid an extra cascading render.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <header className="border-glass-stroke bg-surface/60 fixed top-0 z-50 w-full border-b backdrop-blur-xl">
      <div className="container-max px-margin-mobile md:px-gutter flex h-20 items-center justify-between">
        <Link
          href="/"
          className="text-headline-sm text-primary flex items-center gap-3 font-bold tracking-tighter"
        >
          <Logo size={36} />
          T&B
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map((entry) => {
            const isActive =
              entry.href === "/"
                ? pathname === "/"
                : pathname.startsWith(entry.href);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-label-caps hover:text-primary transition-colors",
                  isActive
                    ? "border-primary text-primary border-b-2 pb-1"
                    : "text-on-surface-variant",
                )}
              >
                {entry.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <LanguageToggle />
          </div>
          <ThemeToggle />
          <div className="hidden md:block">
            <Button href="/demande-devis" variant="secondary" size="md">
              Demander un devis
            </Button>
          </div>
          <button
            type="button"
            className="text-primary md:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className="border-glass-stroke bg-surface px-margin-mobile py-stack-md flex flex-col gap-1 border-t md:hidden"
          aria-label="Navigation mobile"
        >
          {NAV_LINKS.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              onClick={() => setOpen(false)}
              className="text-on-surface-variant hover:bg-surface-variant/20 hover:text-primary rounded-lg px-4 py-3"
            >
              {entry.label}
            </Link>
          ))}
          <Link
            href="/demande-devis"
            onClick={() => setOpen(false)}
            className="border-primary text-primary mt-2 rounded-lg border px-4 py-3 text-center font-bold"
          >
            Demander un devis
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="bg-primary-container text-on-accent mt-2 rounded-lg px-4 py-3 text-center font-bold"
          >
            Contactez-nous
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
