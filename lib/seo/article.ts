import type { BlogPosting, WithContext } from "schema-dts";
import { SITE_URL } from "@/lib/constants";
import { ORGANIZATION_REF } from "@/lib/seo/organization";

export function getBlogPostingJsonLd({
  slug,
  title,
  description,
  publishedAt,
  updatedAt,
}: {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date | string | null;
  updatedAt: Date | string;
}): WithContext<BlogPosting> {
  const url = `${SITE_URL}/blog/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: `${SITE_URL}/api/og/blog/${slug}`,
    url,
    mainEntityOfPage: url,
    datePublished: publishedAt
      ? new Date(publishedAt).toISOString()
      : new Date(updatedAt).toISOString(),
    dateModified: new Date(updatedAt).toISOString(),
    author: ORGANIZATION_REF,
    publisher: {
      ...ORGANIZATION_REF,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon`,
      },
    },
  };
}
