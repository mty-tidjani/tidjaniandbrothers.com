"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CaseStudy } from "@prisma/client";

type CaseStudyEditorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  study?: CaseStudy;
};

export function CaseStudyEditorForm({
  action,
  study,
}: CaseStudyEditorFormProps) {
  const [published, setPublished] = useState(study?.published ?? false);

  return (
    <form
      action={action}
      className="gap-gutter grid grid-cols-1 lg:grid-cols-3"
    >
      <input
        type="hidden"
        name="published"
        value={published ? "true" : "false"}
      />

      <div className="space-y-stack-md lg:col-span-2">
        <div className="glass-card space-y-4 rounded-lg p-6">
          <h2 className="text-headline-sm text-on-surface">
            Informations générales
          </h2>
          <FormField label="Secteur / type d'entreprise" htmlFor="sector">
            <Input
              id="sector"
              name="sector"
              defaultValue={study?.sector}
              placeholder="ex : Commerce de détail, Yaoundé"
              required
            />
          </FormField>
          <FormField label="Slug (URL)" htmlFor="slug">
            <Input
              id="slug"
              name="slug"
              defaultValue={study?.slug}
              placeholder="commerce-detail-yaounde"
              required
            />
          </FormField>
        </div>

        <div className="glass-card space-y-6 rounded-lg p-6">
          <h2 className="text-headline-sm text-on-surface">Transformation</h2>
          <FormField label="Avant (situation initiale)" htmlFor="before">
            <Textarea
              id="before"
              name="before"
              defaultValue={study?.before}
              rows={5}
              placeholder="Décrivez la situation avant l'intervention..."
              required
            />
          </FormField>
          <FormField label="Après (résultat)" htmlFor="after">
            <Textarea
              id="after"
              name="after"
              defaultValue={study?.after}
              rows={5}
              placeholder="Décrivez le résultat obtenu..."
              required
            />
          </FormField>
          <FormField
            label="Résultat chiffré (optionnel)"
            htmlFor="resultMetric"
          >
            <Input
              id="resultMetric"
              name="resultMetric"
              defaultValue={study?.resultMetric ?? ""}
              placeholder="ex : Temps de facturation réduit de 2 jours à quelques heures"
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-stack-md">
        <div className="glass-card rounded-lg p-6">
          <h2 className="text-headline-sm text-on-surface mb-4">Statut</h2>
          <label className="border-glass-stroke bg-surface-container flex cursor-pointer items-center justify-between rounded-lg border p-4">
            <div>
              <span className="text-on-surface block font-bold">Publié</span>
              <span className="text-on-surface-variant text-sm">
                Visible sur le portfolio public
              </span>
            </div>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-primary-container h-5 w-5"
            />
          </label>
        </div>

        <div className="glass-card rounded-lg p-6">
          <h2 className="text-headline-sm text-on-surface mb-4">Images</h2>
          <div className="border-glass-stroke text-on-surface-variant mb-3 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center">
            <UploadCloud className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">
              Upload à venir — chemins manuels ci-dessous
            </p>
          </div>
          <Input
            name="imagePaths"
            defaultValue={study?.imagePaths?.[0] ?? ""}
            placeholder="/uploads/avant-apres.jpg"
          />
        </div>

        <Button type="submit" className="w-full">
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}
