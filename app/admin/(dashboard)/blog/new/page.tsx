import type { Metadata } from "next";
import { BlogEditorForm } from "@/components/forms/BlogEditorForm";
import { createBlogPost } from "@/lib/actions/blog";

export const metadata: Metadata = {
  title: "Nouvel article",
  robots: { index: false },
};

export default function NewBlogPostPage() {
  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">Nouvel article</h1>
        <p className="text-on-surface-variant mt-1">
          Créez du contenu pour le blog Spartiat-AI.
        </p>
      </header>
      <BlogEditorForm action={createBlogPost} />
    </div>
  );
}
