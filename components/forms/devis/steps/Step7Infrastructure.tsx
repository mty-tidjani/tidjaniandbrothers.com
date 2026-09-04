"use client";

import { useFormContext } from "react-hook-form";
import type { DevisFullInput } from "@/lib/validation/devis";
import { DEVIS_HARDWARE } from "@/lib/constants";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";

export function Step7Infrastructure() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<DevisFullInput>();

  const availableHardware = watch("availableHardware") ?? [];

  const toggleHardware = (value: (typeof DEVIS_HARDWARE)[number]["value"]) => {
    setValue(
      "availableHardware",
      availableHardware.includes(value)
        ? availableHardware.filter((v) => v !== value)
        : [...availableHardware, value],
      { shouldValidate: true },
    );
  };

  return (
    <div className="space-y-stack-md">
      <div className="mb-stack-lg">
        <h2 className="text-headline-md text-on-surface mb-2">
          Votre infrastructure
        </h2>
        <p className="text-on-surface-variant">
          Quelques questions sur votre équipement actuel.
        </p>
      </div>

      <FormField
        label="Avez-vous une connexion internet stable ?"
        htmlFor="hasStableInternet"
        error={errors.hasStableInternet?.message}
      >
        <Select
          id="hasStableInternet"
          defaultValue=""
          {...register("hasStableInternet")}
        >
          <option value="" disabled>
            Sélectionnez une option
          </option>
          <option value="oui">Oui</option>
          <option value="non">Non</option>
        </Select>
      </FormField>

      <FormField
        label="Matériel disponible"
        htmlFor="availableHardware"
        error={errors.availableHardware?.message}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DEVIS_HARDWARE.map((hardware) => (
            <Checkbox
              key={hardware.value}
              label={hardware.label}
              checked={availableHardware.includes(hardware.value)}
              onChange={() => toggleHardware(hardware.value)}
            />
          ))}
        </div>
      </FormField>
    </div>
  );
}
