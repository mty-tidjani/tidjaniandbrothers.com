import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";

export default function SmsAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="px-margin-mobile relative flex min-h-screen flex-col items-center justify-center py-12">
      <div className="ambient-mesh" aria-hidden="true" />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="mb-stack-md flex items-center gap-3">
        <Logo size={44} />
        <span className="text-headline-sm text-primary tracking-tighter">
          Tidjani & Brothers
        </span>
      </Link>
      {children}
    </main>
  );
}
