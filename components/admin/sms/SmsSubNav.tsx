import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/sms", label: "Comptes clients" },
  { href: "/admin/sms/senders", label: "Noms d'expéditeur" },
  { href: "/admin/sms/pricing", label: "Tarifs & marges" },
] as const;

export function SmsSubNav({
  active,
}: {
  active: (typeof TABS)[number]["href"];
}) {
  return (
    <nav className="border-glass-stroke flex gap-1 overflow-x-auto border-b">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.href === active ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 px-4 py-2 text-sm whitespace-nowrap transition-colors",
            tab.href === active
              ? "border-primary text-primary font-bold"
              : "text-on-surface-variant hover:text-on-surface border-transparent",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
