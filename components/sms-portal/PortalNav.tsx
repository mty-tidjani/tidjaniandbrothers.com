"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  History,
  Wallet,
  BadgeCheck,
  KeyRound,
  BookOpen,
  UserCog,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { logoutPortal } from "@/lib/actions/sms-portal-auth";

const LINKS = [
  { href: "/sms", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/sms/envoyer", label: "Envoyer un SMS", icon: Send },
  { href: "/sms/historique", label: "Historique", icon: History },
  { href: "/sms/credits", label: "Crédits", icon: Wallet },
  { href: "/sms/expediteurs", label: "Expéditeurs", icon: BadgeCheck },
  { href: "/sms/cles-api", label: "Clés API", icon: KeyRound },
  { href: "/sms/documentation", label: "Documentation API", icon: BookOpen },
  { href: "/sms/compte", label: "Mon compte", icon: UserCog },
];

function isActive(pathname: string, href: string) {
  return href === "/sms" ? pathname === "/sms" : pathname.startsWith(href);
}

export function PortalNav({
  companyName,
  credits,
}: {
  companyName: string;
  credits: number;
}) {
  const pathname = usePathname();
  const creditsLabel = new Intl.NumberFormat("fr-FR").format(credits);

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="border-glass-stroke bg-surface-container-low py-stack-md fixed top-0 left-0 hidden h-screen w-64 flex-col border-r md:flex">
        <div className="mb-stack-md px-gutter">
          <Link href="/sms" className="flex items-center gap-3">
            <Logo size={32} />
            <span className="text-headline-sm text-primary tracking-tighter">
              Espace SMS
            </span>
          </Link>
          <p className="text-on-surface-variant mt-2 truncate text-sm">
            {companyName}
          </p>
          <Link
            href="/sms/credits"
            className="border-glass-stroke bg-surface-container text-on-surface hover:border-primary mt-3 block rounded-lg border px-3 py-2 text-sm transition-colors"
          >
            <span className="text-on-surface-variant">Solde : </span>
            <strong>{creditsLabel} crédits</strong>
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors",
                  active
                    ? "border-primary bg-primary-container/10 text-primary border-r-2 font-bold"
                    : "text-on-surface-variant hover:bg-surface-variant/20 hover:text-on-surface",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="border-glass-stroke pt-stack-md mt-auto flex items-center justify-between border-t px-3">
          <form action={logoutPortal}>
            <button
              type="submit"
              className="text-error hover:bg-error/10 flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Déconnexion
            </button>
          </form>
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile: header + horizontally scrollable tabs */}
      <header className="border-glass-stroke bg-surface-container-low sticky top-0 z-30 border-b md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/sms" className="flex min-w-0 items-center gap-2">
            <Logo size={28} />
            <span className="text-primary truncate font-bold">Espace SMS</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/sms/credits"
              className="border-glass-stroke text-on-surface rounded-lg border px-2.5 py-1 text-sm font-bold"
            >
              {creditsLabel} cr.
            </Link>
            <ThemeToggle />
            <form action={logoutPortal}>
              <button
                type="submit"
                className="text-error p-2"
                aria-label="Déconnexion"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
          {LINKS.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm whitespace-nowrap",
                  active
                    ? "bg-primary-container/15 text-primary font-bold"
                    : "text-on-surface-variant",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
