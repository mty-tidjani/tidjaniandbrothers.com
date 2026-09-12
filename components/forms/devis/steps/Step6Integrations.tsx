"use client";

import { useFormContext } from "react-hook-form";
import type { DevisFullInput } from "@/lib/validation/devis";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function Step6Integrations() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<DevisFullInput>();

  const hasEcommerceSite = watch("hasEcommerceSite");

  return (
    <div className="space-y-stack-md">
      <div className="mb-stack-lg">
        <h2 className="text-headline-md text-on-surface mb-2">
          Intégrations
        </h2>
        <p className="text-on-surface-variant">
          Quels outils souhaitez-vous connecter à Odoo&nbsp;?
        </p>
      </div>

      {/* <FormField
        label="Mobile Money souhaité ?"
        htmlFor="wantsMobileMoney"
        error={errors.wantsMobileMoney?.message}
      >
        <Select
          id="wantsMobileMoney"
          defaultValue=""
          {...register("wantsMobileMoney")}
        >
          <option value="" disabled>
            Sélectionnez une option
          </option>
          <option value="oui">Oui</option>
          <option value="non">Non</option>
        </Select>
      </FormField> */}

      <FormField
        label="Avez-vous un site e-commerce existant à connecter ?"
        htmlFor="hasEcommerceSite"
        error={errors.hasEcommerceSite?.message}
      >
        <Select
          id="hasEcommerceSite"
          defaultValue=""
          {...register("hasEcommerceSite")}
        >
          <option value="" disabled>
            Sélectionnez une option
          </option>
          <option value="oui">Oui</option>
          <option value="non">Non</option>
        </Select>
      </FormField>

      {hasEcommerceSite === "oui" ? (
        <FormField
          label="URL du site (optionnel)"
          htmlFor="ecommerceUrl"
          error={errors.ecommerceUrl?.message}
        >
          <Input
            id="ecommerceUrl"
            type="url"
            placeholder="https://monsite.cm"
            {...register("ecommerceUrl")}
          />
        </FormField>
      ) : null}

      <FormField
        label="Autres logiciels à connecter (optionnel)"
        htmlFor="otherSoftware"
        error={errors.otherSoftware?.message}
      >
        <Textarea
          id="otherSoftware"
          rows={2}
          placeholder="Ex: logiciel de paie, comptabilité externe..."
          {...register("otherSoftware")}
        />
      </FormField>
    </div>
  );
}
