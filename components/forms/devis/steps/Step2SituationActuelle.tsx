"use client";

import { useFormContext } from "react-hook-form";
import type { DevisFullInput } from "@/lib/validation/devis";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function Step2SituationActuelle() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DevisFullInput>();

  return (
    <div className="space-y-stack-md">
      <div className="mb-stack-lg">
        <h2 className="text-headline-md text-on-surface mb-2">
          Votre situation actuelle
        </h2>
        <p className="text-on-surface-variant">
          Comment gérez-vous aujourd&rsquo;hui votre activité&nbsp;?
        </p>
      </div>

      <FormField
        label="Comment gérez-vous factures / stock / ventes aujourd'hui ?"
        htmlFor="currentManagement"
        error={errors.currentManagement?.message}
      >
        <Select
          id="currentManagement"
          defaultValue=""
          {...register("currentManagement")}
        >
          <option value="" disabled>
            Sélectionnez une option
          </option>
          <option value="excel">Excel</option>
          <option value="papier">Papier</option>
          <option value="autre_logiciel">Autre logiciel</option>
          <option value="autre">Autre</option>
        </Select>
      </FormField>

      <FormField
        label="Précisions (optionnel)"
        htmlFor="currentManagementDetail"
        error={errors.currentManagementDetail?.message}
      >
        <Textarea
          id="currentManagementDetail"
          rows={2}
          placeholder="Ex: nom du logiciel actuel, méthode utilisée..."
          {...register("currentManagementDetail")}
        />
      </FormField>

      <FormField
        label="Quel est le problème principal à résoudre ?"
        htmlFor="mainProblem"
        error={errors.mainProblem?.message}
      >
        <Textarea
          id="mainProblem"
          rows={3}
          placeholder="Décrivez votre principale difficulté actuelle"
          {...register("mainProblem")}
        />
      </FormField>

      <FormField
        label="Avez-vous déjà utilisé Odoo ?"
        htmlFor="hasUsedOdoo"
        error={errors.hasUsedOdoo?.message}
      >
        <Select id="hasUsedOdoo" defaultValue="" {...register("hasUsedOdoo")}>
          <option value="" disabled>
            Sélectionnez une option
          </option>
          <option value="oui">Oui</option>
          <option value="non">Non</option>
        </Select>
      </FormField>
    </div>
  );
}
