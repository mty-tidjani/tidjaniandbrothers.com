import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

const SITE_NAME = "Tidjani & Brothers";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: Date | string | null;
  modifiedTime?: Date | string | null;
  // Route-relative path to that segment's `opengraph-image` (Next.js only
  // auto-injects the file-convention image when a page has NO explicit
  // `openGraph` object of its own — since every page here sets one, to get
  // its own per-page title/description, the image has to be wired in by
  // hand instead of relying on that auto-merge).
  imagePath?: string;
};

export function buildMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  imagePath,
}: BuildMetadataInput): Metadata {
  const image = { url: imagePath ?? "/opengraph-image", width: 1200, height: 630 };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type,
      images: [image],
      ...(type === "article" && publishedTime
        ? {
            publishedTime: new Date(publishedTime).toISOString(),
            ...(modifiedTime
              ? { modifiedTime: new Date(modifiedTime).toISOString() }
              : {}),
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
