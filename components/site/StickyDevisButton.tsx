"use client";

import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function StickyDevisButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/demande-devis")) return null;

  return (
    <div className="fixed right-4 bottom-4 z-40 md:hidden">
      <Button href="/demande-devis" className="shadow-xl">
        <FileText className="h-4 w-4" aria-hidden="true" />
        Demander un devis
      </Button>
    </div>
  );
}
