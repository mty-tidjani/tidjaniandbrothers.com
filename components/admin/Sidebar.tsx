"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ListChecks,
  Blocks,
  FileEdit,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_LINKS } from "@/lib/constants";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  leaderboard: ListChecks,
  request_quote: Receipt,
  edit_note: FileEdit,
  business_center: Briefcase,
  extension: Blocks,
  group: Users,
  settings: Settings,
};

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="border-glass-stroke bg-deep-black py-stack-md fixed top-0 left-0 hidden h-screen w-64 flex-col border-r md:flex">
      <div className="mb-stack-lg px-gutter">
        <h1 className="text-headline-sm text-primary tracking-tighter">
          Tidjani & Brothers
        </h1>
        <p className="text-label-caps text-on-surface-variant mt-1 tracking-widest uppercase">
          Admin Terminal
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3">
        {ADMIN_NAV_LINKS.filter((link) => isAdmin || !link.adminOnly).map(
          (link) => {
            const Icon = ICONS[link.icon];
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                  isActive
                    ? "border-primary bg-primary-container/10 text-primary border-r-2 font-bold"
                    : "text-on-surface-variant hover:bg-surface-variant/20 hover:text-on-surface",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {link.label}
              </Link>
            );
          },
        )}
      </div>

      <div className="border-glass-stroke pt-stack-md mt-auto space-y-1 border-t px-3">
        <Link
          href="/"
          className="border-glass-stroke text-primary hover:bg-primary-container/10 block rounded-lg border px-4 py-2 text-center transition-colors"
        >
          Voir le site
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-error hover:bg-error/10 flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
