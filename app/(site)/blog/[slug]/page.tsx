import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getPublishedBlogPostBySlug } from "@/lib/data/blog";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container-max px-margin-mobile pb-section-gap-desktop md:px-gutter">
      <Link
        href="/blog"
        className="mb-stack-md text-label-caps text-primary inline-flex items-center gap-2 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour au blog
      </Link>

      <header className="mb-stack-lg max-w-4xl">
        <h1 className="text-display mb-stack-md text-on-surface">
          {post.title}
        </h1>
        <div className="gap-gutter text-label-caps text-on-surface-variant flex flex-wrap items-center uppercase">
          {post.publishedAt ? (
            <span>{formatDate(post.publishedAt)}</span>
          ) : null}
          <span className="text-primary">
            {BLOG_CATEGORY_LABELS[post.category] ?? post.category}
          </span>
        </div>
      </header>

      {post.coverImagePath ? (
        <div className="border-glass-stroke mb-section-gap-mobile relative aspect-video max-w-3xl overflow-hidden rounded-2xl border">
          <Image
            src={post.coverImagePath}
            alt=""
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {/* contentHtml is authored exclusively by authenticated admin/editor accounts
          via the Tiptap editor — not arbitrary visitor input. */}
      <div
        className="prose prose-invert prose-headings:text-on-surface prose-p:text-on-surface-variant prose-a:text-primary prose-strong:text-on-surface max-w-3xl"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <div className="mt-section-gap-mobile gap-stack-md grid max-w-3xl grid-cols-1 md:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="text-headline-sm text-on-surface mb-2">
            Cet article vous a été utile&nbsp;?
          </h2>
          <p className="mb-stack-md text-on-surface-variant">
            Réservez un audit gratuit pour évaluer votre situation.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/reserver-audit">Réserver un audit gratuit</Button>
            <Button href="/demande-devis" variant="secondary">
              Demander un devis
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-headline-sm text-on-surface mb-2">
            Recevez nos conseils PME
          </h2>
          <NewsletterForm />
        </GlassCard>
      </div>
    </article>
  );
}
