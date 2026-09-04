"use client";

import { useFormContext } from "react-hook-form";
import type { DevisFullInput } from "@/lib/validation/devis";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function Step5DonneesAMigrer() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<DevisFullInput>();

  const hasExistingData = watch("hasExistingData");

  return (
    <div className="space-y-stack-md">
      <div className="mb-stack-lg">
        <h2 className="text-headline-md text-on-surface mb-2">
          Données à migrer
        </h2>
        <p className="text-on-surface-variant">
          Avez-vous des données existantes à reprendre&nbsp;?
        </p>
      </div>

      <FormField
        label="Avez-vous des données existantes ?"
        htmlFor="hasExistingData"
        error={errors.hasExistingData?.message}
      >
        <Select
          id="hasExistingData"
          defaultValue=""
          {...register("hasExistingData")}
        >
          <option value="" disabled>
            Sélectionnez une option
          </option>
          <option value="oui">Oui</option>
          <option value="non">Non</option>
        </Select>
      </FormField>

      {hasExistingData === "oui" ? (
        <>
          <FormField
            label="Format des données"
            htmlFor="dataFormat"
            error={errors.dataFormat?.message}
          >
            <Select id="dataFormat" defaultValue="" {...register("dataFormat")}>
              <option value="" disabled>
                Sélectionnez une option
              </option>
              <option value="excel">Excel</option>
              <option value="papier">Papier</option>
              <option value="autre_logiciel">Autre logiciel</option>
            </Select>
          </FormField>

          <FormField
            label="Volume approximatif (optionnel)"
            htmlFor="approximateVolume"
            error={errors.approximateVolume?.message}
          >
            <Input
              id="approximateVolume"
              placeholder="Ex: 500 clients, 2000 factures"
              {...register("approximateVolume")}
            />
          </FormField>
        </>
      ) : null}
    </div>
  );
}
