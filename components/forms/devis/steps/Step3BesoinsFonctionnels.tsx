"use client";

import { useFormContext } from "react-hook-form";
import type { DevisFullInput } from "@/lib/validation/devis";
import { DEVIS_FEATURES } from "@/lib/constants";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";

export function Step3BesoinsFonctionnels() {
  const {
    watch,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<DevisFullInput>();

  const features = watch("features") ?? [];

  const toggleFeature = (value: (typeof DEVIS_FEATURES)[number]["value"]) => {
    setValue(
      "features",
      features.includes(value)
        ? features.filter((v) => v !== value)
        : [...features, value],
      { shouldValidate: true },
    );
  };

  return (
    <div className="space-y-stack-md">
      <div className="mb-stack-lg">
        <h2 className="text-headline-md text-on-surface mb-2">
          Vos besoins fonctionnels
        </h2>
        <p className="text-on-surface-variant">
          Sélectionnez les modules dont vous avez besoin.
        </p>
      </div>

      <FormField
        label="Modules souhaités (plusieurs choix possibles)"
        htmlFor="features"
        error={errors.features?.message}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DEVIS_FEATURES.map((feature) => (
            <Checkbox
              key={feature.value}
              label={feature.label}
              checked={features.includes(feature.value)}
              onChange={() => toggleFeature(feature.value)}
            />
          ))}
        </div>
      </FormField>

      {features.includes("gestion_stock") ? (
        <FormField
          label="Nombre approximatif de produits"
          htmlFor="productCount"
          error={errors.productCount?.message}
        >
          <Input
            id="productCount"
            type="number"
            min={1}
            placeholder="200"
            {...register("productCount")}
          />
        </FormField>
      ) : null}
    </div>
  );
}
