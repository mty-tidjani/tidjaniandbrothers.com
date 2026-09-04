import type { Metadata } from "next";
import { BlogCard } from "@/components/site/BlogCard";
import { getPublishedBlogPosts } from "@/lib/data/blog";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Conseils digitalisation, Odoo ERP et actualités pour les PME camerounaises.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <section className="container-max px-margin-mobile md:px-gutter">
      <div className="mb-section-gap-mobile max-w-2xl">
        <h1 className="text-display mb-stack-sm text-on-surface">
          Le <span className="text-primary">blog</span>
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Nos conseils sur la digitalisation, Odoo et la gestion PME.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="pb-section-gap-desktop text-on-surface-variant">
          Aucun article publié pour le moment.
        </p>
      ) : (
        <div className="gap-gutter pb-section-gap-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <BlogCard
              key={post.id}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              category={post.category}
              publishedAt={post.publishedAt}
              coverImagePath={post.coverImagePath}
              featured={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
