"use client";

import { useFormContext } from "react-hook-form";
import type { DevisFullInput } from "@/lib/validation/devis";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function Step4Utilisateurs() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DevisFullInput>();

  return (
    <div className="space-y-stack-md">
      <div className="mb-stack-lg">
        <h2 className="text-headline-md text-on-surface mb-2">
          Vos utilisateurs
        </h2>
        <p className="text-on-surface-variant">
          Qui utilisera Odoo au quotidien&nbsp;?
        </p>
      </div>

      <FormField
        label="Nombre d'utilisateurs quotidiens"
        htmlFor="dailyUserCount"
        error={errors.dailyUserCount?.message}
      >
        <Input
          id="dailyUserCount"
          type="number"
          min={1}
          placeholder="5"
          {...register("dailyUserCount")}
        />
      </FormField>

      <FormField
        label="Niveau de confort numérique de l'équipe"
        htmlFor="comfortLevel"
        error={errors.comfortLevel?.message}
      >
        <Select id="comfortLevel" defaultValue="" {...register("comfortLevel")}>
          <option value="" disabled>
            Sélectionnez une option
          </option>
          <option value="debutant">Débutant</option>
          <option value="intermediaire">Intermédiaire</option>
          <option value="a_l_aise">À l&rsquo;aise</option>
        </Select>
      </FormField>

      <FormField
        label="Besoin de formation"
        htmlFor="trainingNeed"
        error={errors.trainingNeed?.message}
      >
        <Select id="trainingNeed" defaultValue="" {...register("trainingNeed")}>
          <option value="" disabled>
            Sélectionnez une option
          </option>
          <option value="sur_site">Sur site</option>
          <option value="a_distance">À distance</option>
          <option value="les_deux">Les deux</option>
        </Select>
      </FormField>
    </div>
  );
}
