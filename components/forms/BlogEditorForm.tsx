"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, UploadCloud } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants";
import type { BlogPost } from "@prisma/client";

type BlogEditorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  post?: BlogPost;
};

export function BlogEditorForm({ action, post }: BlogEditorFormProps) {
  const [seoOpen, setSeoOpen] = useState(false);
  const [status, setStatus] = useState(post?.status ?? "DRAFT");

  return (
    <form
      action={action}
      className="gap-gutter grid grid-cols-1 lg:grid-cols-3"
    >
      <input type="hidden" name="status" value={status} />

      <div className="space-y-stack-md lg:col-span-2">
        <div className="glass-card p-stack-md space-y-4 rounded-lg">
          <FormField label="Titre de l'article" htmlFor="title">
            <Input
              id="title"
              name="title"
              defaultValue={post?.title}
              placeholder="Un titre engageant..."
              required
            />
          </FormField>
          <FormField label="Slug (URL)" htmlFor="slug">
            <Input
              id="slug"
              name="slug"
              defaultValue={post?.slug}
              placeholder="mon-article"
              required
            />
          </FormField>
          <FormField label="Extrait / résumé" htmlFor="excerpt">
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={post?.excerpt}
              rows={3}
              placeholder="Un bref résumé pour la carte de liste..."
              required
            />
          </FormField>
        </div>

        <div>
          <span className="text-label-caps text-on-surface mb-2 block">
            Contenu
          </span>
          <RichTextEditor name="contentHtml" defaultValue={post?.contentHtml} />
        </div>
      </div>

      <div className="space-y-stack-md">
        <div className="glass-card p-stack-md space-y-4 rounded-lg">
          <h3 className="text-headline-sm text-on-surface">Détails</h3>
          <FormField label="Catégorie" htmlFor="category">
            <Select
              id="category"
              name="category"
              defaultValue={post?.category ?? ""}
              required
            >
              <option value="" disabled>
                Sélectionnez une catégorie
              </option>
              {Object.entries(BLOG_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>
          <div>
            <span className="text-label-caps text-on-surface mb-2 block">
              Image de couverture
            </span>
            <div className="border-glass-stroke text-on-surface-variant flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center">
              <UploadCloud className="h-8 w-8" aria-hidden="true" />
              <p className="text-sm">
                Upload à venir — champ manuel ci-dessous
              </p>
            </div>
            <Input
              name="coverImagePath"
              defaultValue={post?.coverImagePath ?? ""}
              placeholder="/uploads/mon-image.jpg"
              className="mt-2"
            />
          </div>
        </div>

        <div className="glass-card p-stack-md rounded-lg">
          <button
            type="button"
            onClick={() => setSeoOpen((v) => !v)}
            className="text-headline-sm text-on-surface flex w-full items-center justify-between"
          >
            SEO (optionnel)
            {seoOpen ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          {seoOpen ? (
            <div className="mt-4 space-y-4">
              <FormField label="Meta titre" htmlFor="metaTitle">
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  defaultValue={post?.metaTitle ?? ""}
                  placeholder="Titre optimisé pour les moteurs de recherche"
                />
              </FormField>
              <FormField label="Meta description" htmlFor="metaDescription">
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  defaultValue={post?.metaDescription ?? ""}
                  rows={3}
                  placeholder="Description engageante pour les résultats de recherche"
                />
              </FormField>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            variant="secondary"
            onClick={() => setStatus("DRAFT")}
          >
            Enregistrer le brouillon
          </Button>
          <Button type="submit" onClick={() => setStatus("PUBLISHED")}>
            Publier
          </Button>
        </div>
      </div>
    </form>
  );
}
