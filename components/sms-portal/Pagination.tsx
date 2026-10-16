import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Prev/next links that keep the current query string. */
export function Pagination({
  page,
  pages,
  basePath,
  params,
}: {
  page: number;
  pages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    query.set("page", String(p));
    return `${basePath}?${query.toString()}`;
  };
  const linkClass =
    "border-glass-stroke text-on-surface hover:border-primary flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors";

  return (
    <nav
      className="flex items-center justify-between gap-3"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Précédent
        </Link>
      ) : (
        <span />
      )}
      <span className="text-on-surface-variant text-sm">
        Page {page} sur {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className={linkClass}>
          Suivant
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function parsePage(raw: string | undefined): number {
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
