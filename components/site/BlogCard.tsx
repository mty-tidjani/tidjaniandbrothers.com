import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

type BlogCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: Date | string | null;
  featured?: boolean;
};

export function BlogCard({
  slug,
  title,
  excerpt,
  category,
  publishedAt,
  featured = false,
}: BlogCardProps) {
  return (
    <GlassCard
      className={featured ? "flex flex-col md:col-span-2" : "flex flex-col"}
    >
      <Link href={`/blog/${slug}`} className="flex flex-1 flex-col p-6">
        <span className="text-primary mb-3 text-[10px] tracking-widest uppercase">
          {BLOG_CATEGORY_LABELS[category] ?? category}
        </span>
        <h3 className="text-headline-sm text-on-surface mb-3 leading-tight">
          {title}
        </h3>
        <p className="text-on-surface-variant mb-4 line-clamp-3 flex-1">
          {excerpt}
        </p>
        {publishedAt ? (
          <span className="text-on-surface-variant/70 text-sm">
            {formatDate(publishedAt)}
          </span>
        ) : null}
      </Link>
    </GlassCard>
  );
}
