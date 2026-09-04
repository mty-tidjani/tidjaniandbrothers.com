"use client";

import { useFormContext } from "react-hook-form";
import type { DevisFullInput } from "@/lib/validation/devis";
import { SECTORS } from "@/lib/constants";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function Step1InfosGenerales() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DevisFullInput>();

  return (
    <div className="space-y-stack-md">
      <div className="mb-stack-lg">
        <h2 className="text-headline-md text-on-surface mb-2">
          Parlez-nous de votre entreprise
        </h2>
        <p className="text-on-surface-variant">
          Ces informations générales nous aident à cadrer votre projet.
        </p>
      </div>

      <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
        <FormField
          label="Nom de l'entreprise"
          htmlFor="companyName"
          error={errors.companyName?.message}
        >
          <Input
            id="companyName"
            placeholder="Mon Entreprise S.A."
            {...register("companyName")}
          />
        </FormField>
        <FormField
          label="Secteur d'activité"
          htmlFor="sector"
          error={errors.sector?.message}
        >
          <Select id="sector" defaultValue="" {...register("sector")}>
            <option value="" disabled>
              Sélectionnez votre secteur
            </option>
            {SECTORS.map((sector) => (
              <option key={sector.value} value={sector.value}>
                {sector.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
        <FormField
          label="Nombre d'employés"
          htmlFor="employeeCount"
          error={errors.employeeCount?.message}
        >
          <Input
            id="employeeCount"
            type="number"
            min={1}
            placeholder="10"
            {...register("employeeCount")}
          />
        </FormField>
        <FormField
          label="Nombre de sites"
          htmlFor="siteCount"
          error={errors.siteCount?.message}
        >
          <Input
            id="siteCount"
            type="number"
            min={1}
            placeholder="1"
            {...register("siteCount")}
          />
        </FormField>
      </div>

      <FormField label="Ville" htmlFor="city" error={errors.city?.message}>
        <Input id="city" placeholder="Yaoundé" {...register("city")} />
      </FormField>
    </div>
  );
}
