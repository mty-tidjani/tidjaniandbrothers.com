"use client";

import { useFormContext } from "react-hook-form";
import type { DevisFullInput } from "@/lib/validation/devis";
import { DEVIS_TIMELINES } from "@/lib/constants";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function Step8DelaiBudget() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DevisFullInput>();

  return (
    <div className="space-y-stack-md">
      <div className="mb-stack-lg">
        <h2 className="text-headline-md text-on-surface mb-2">
          Délai et budget
        </h2>
        <p className="text-on-surface-variant">
          Pour vous proposer un chiffrage adapté à votre calendrier.
        </p>
      </div>

      <FormField
        label="Délai souhaité"
        htmlFor="desiredTimeline"
        error={errors.desiredTimeline?.message}
      >
        <Select
          id="desiredTimeline"
          defaultValue=""
          {...register("desiredTimeline")}
        >
          <option value="" disabled>
            Sélectionnez une option
          </option>
          {DEVIS_TIMELINES.map((timeline) => (
            <option key={timeline.value} value={timeline.value}>
              {timeline.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Budget déjà en tête (optionnel)"
        htmlFor="budget"
        error={errors.budget?.message}
      >
        <Input
          id="budget"
          placeholder="Ex: 500 000 - 1 000 000 FCFA"
          {...register("budget")}
        />
      </FormField>

      <FormField
        label="Intéressé par un site web en plus ?"
        htmlFor="interestedInWebsite"
        error={errors.interestedInWebsite?.message}
      >
        <Select
          id="interestedInWebsite"
          defaultValue=""
          {...register("interestedInWebsite")}
        >
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
