"use client";

import { useFormContext } from "react-hook-form";
import type { DevisFullInput } from "@/lib/validation/devis";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";

export function Step9Contact() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DevisFullInput>();

  return (
    <div className="space-y-stack-md">
      <div className="mb-stack-lg">
        <h2 className="text-headline-md text-on-surface mb-2">
          Vos coordonnées
        </h2>
        <p className="text-on-surface-variant">
          Dernière étape&nbsp;! Comment vous recontacter avec votre devis
          détaillé&nbsp;?
        </p>
      </div>

      <FormField
        label="Nom du décisionnaire"
        htmlFor="contactName"
        error={errors.contactName?.message}
      >
        <Input
          id="contactName"
          placeholder="Jean Dupont"
          {...register("contactName")}
        />
      </FormField>

      <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
        <FormField
          label="Téléphone"
          htmlFor="contactPhone"
          error={errors.contactPhone?.message}
        >
          <Input
            id="contactPhone"
            type="tel"
            placeholder="+237 6XX XXX XXX"
            {...register("contactPhone")}
          />
        </FormField>
        <FormField
          label="Email"
          htmlFor="contactEmail"
          error={errors.contactEmail?.message}
        >
          <Input
            id="contactEmail"
            type="email"
            placeholder="jean@entreprise.cm"
            {...register("contactEmail")}
          />
        </FormField>
      </div>

      <FormField
        label="Meilleur moment pour être recontacté"
        htmlFor="bestContactTime"
        error={errors.bestContactTime?.message}
      >
        <Input
          id="bestContactTime"
          placeholder="Ex: en semaine, avant midi"
          {...register("bestContactTime")}
        />
      </FormField>
    </div>
  );
}
