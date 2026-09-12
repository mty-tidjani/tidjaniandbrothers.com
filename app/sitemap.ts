import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getPublishedBlogPosts } from "@/lib/data/blog";
import { getPublishedCaseStudies } from "@/lib/data/portfolio";

const STATIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/services/odoo",
  "/services/web-design",
  "/portfolio",
  "/blog",
  "/reserver-audit",
  "/demande-devis",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, caseStudies] = await Promise.all([
    getPublishedBlogPosts(),
    getPublishedCaseStudies(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  const caseStudyEntries: MetadataRoute.Sitemap = caseStudies.map(
    (study) => ({
      url: `${SITE_URL}/portfolio/${study.slug}`,
      lastModified: study.updatedAt,
    }),
  );

  return [...staticEntries, ...postEntries, ...caseStudyEntries];
}
