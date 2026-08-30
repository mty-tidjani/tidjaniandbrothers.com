import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/site/ThemeToggle";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="ambient-mesh" aria-hidden="true" />
      <header className="container-max px-margin-mobile md:px-gutter flex items-center justify-between py-6">
        <Link
          href="/"
          className="text-headline-sm text-primary font-bold tracking-tighter"
        >
          Spartiat-AI
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/"
            className="text-label-caps text-on-surface hover:text-primary flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour
          </Link>
        </div>
      </header>
      <main className="px-margin-mobile py-section-gap-mobile md:px-gutter md:py-section-gap-desktop flex flex-1 items-center justify-center">
        {children}
      </main>
    </>
  );
}
