import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogEditorForm } from "@/components/forms/BlogEditorForm";
import { getBlogPostById } from "@/lib/data/blog";
import { updateBlogPost } from "@/lib/actions/blog";

export const metadata: Metadata = {
  title: "Modifier l'article",
  robots: { index: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) notFound();

  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">
          Modifier l&rsquo;article
        </h1>
      </header>
      <BlogEditorForm action={updateBlogPost.bind(null, id)} post={post} />
    </div>
  );
}
