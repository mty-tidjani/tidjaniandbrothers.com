"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, isNavGroup } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { LanguageToggle } from "@/components/site/LanguageToggle";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close any open menus on navigation. Adjusted during render (React's
  // documented escape hatch for resetting state on prop changes) rather
  // than in an effect, to avoid an extra cascading render.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setOpenDropdown(null);
    setOpenMobileGroup(null);
  }

  useEffect(() => {
    if (!openDropdown) return;

    function handlePointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenDropdown(null);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDropdown]);

  return (
    <header className="border-glass-stroke bg-surface/60 fixed top-0 z-50 w-full border-b backdrop-blur-xl">
      <div className="container-max px-margin-mobile md:px-gutter flex h-20 items-center justify-between">
        <Link
          href="/"
          className="text-headline-sm text-primary font-bold tracking-tighter"
        >
          Tidjani & Brothers
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map((entry) => {
            if (isNavGroup(entry)) {
              const isActive = entry.children.some((child) =>
                pathname.startsWith(child.href),
              );
              const isOpen = openDropdown === entry.label;
              return (
                <div key={entry.label} className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    onClick={() => setOpenDropdown(isOpen ? null : entry.label)}
                    className={cn(
                      "text-label-caps hover:text-primary flex items-center gap-1 transition-colors",
                      isActive || isOpen
                        ? "border-primary text-primary border-b-2 pb-1"
                        : "text-on-surface-variant",
                    )}
                  >
                    {entry.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen ? (
                    <div
                      role="menu"
                      aria-label={entry.label}
                      className="border-glass-stroke bg-surface-container-lowest gap-stack-sm absolute top-full left-1/2 mt-3 flex w-56 -translate-x-1/2 flex-col rounded-xl border p-2 shadow-xl"
                    >
                      {entry.children.map((child) => {
                        const isChildActive = pathname.startsWith(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            role="menuitem"
                            aria-current={isChildActive ? "page" : undefined}
                            onClick={() => setOpenDropdown(null)}
                            className={cn(
                              "hover:bg-surface-variant/20 hover:text-primary rounded-lg px-4 py-2 text-sm transition-colors",
                              isChildActive
                                ? "text-primary"
                                : "text-on-surface-variant",
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

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
          <div className="hidden md:block">
            <Button href="/contact" size="md">
              Contactez-nous
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
          {NAV_LINKS.map((entry) => {
            if (isNavGroup(entry)) {
              const isGroupOpen = openMobileGroup === entry.label;
              return (
                <div key={entry.label}>
                  <button
                    type="button"
                    aria-expanded={isGroupOpen}
                    onClick={() =>
                      setOpenMobileGroup(isGroupOpen ? null : entry.label)
                    }
                    className="text-on-surface-variant hover:bg-surface-variant/20 hover:text-primary flex w-full items-center justify-between rounded-lg px-4 py-3"
                  >
                    {entry.label}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isGroupOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {isGroupOpen ? (
                    <div className="flex flex-col gap-1 pl-4">
                      {entry.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="text-on-surface-variant hover:bg-surface-variant/20 hover:text-primary rounded-lg px-4 py-3"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => setOpen(false)}
                className="text-on-surface-variant hover:bg-surface-variant/20 hover:text-primary rounded-lg px-4 py-3"
              >
                {entry.label}
              </Link>
            );
          })}
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
