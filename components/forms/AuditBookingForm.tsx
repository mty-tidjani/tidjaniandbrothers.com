"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  auditBookingSchema,
  type AuditBookingInput,
} from "@/lib/validation/lead";
import { AUDIT_SERVICES, PREFERRED_SLOTS, SECTORS } from "@/lib/constants";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STEP1_FIELDS = [
  "fullName",
  "company",
  "phone",
  "email",
  "sector",
] as const;

export function AuditBookingForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AuditBookingInput>({
    resolver: zodResolver(auditBookingSchema),
    defaultValues: { servicesWanted: [] },
  });

  // react-hook-form's `watch` intentionally returns a non-memoizable function;
  // React Compiler can't safely optimize it, which is expected here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const servicesWanted = watch("servicesWanted") ?? [];

  const goNext = async () => {
    const valid = await trigger(STEP1_FIELDS);
    if (valid) setStep(2);
  };

  const toggleService = (value: string) => {
    const current = servicesWanted;
    setValue(
      "servicesWanted",
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
      { shouldValidate: true },
    );
  };

  const onSubmit = async (data: AuditBookingInput) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "audit" }),
      });
      if (!res.ok) throw new Error("Request failed");
      const params = new URLSearchParams({ phone: data.phone });
      router.push(`/reserver-audit/merci?${params.toString()}`);
    } catch {
      setSubmitError("Une erreur est survenue, réessayez dans un instant.");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-stack-lg relative mx-auto flex w-full max-w-md items-center justify-between">
        <div className="bg-surface-variant absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 rounded-full" />
        <div
          className="bg-primary absolute top-1/2 left-0 z-0 h-1 -translate-y-1/2 rounded-full transition-all duration-300"
          style={{ width: step === 1 ? "0%" : "100%" }}
        />
        {[1, 2].map((n) => (
          <div
            key={n}
            className="relative z-10 flex flex-col items-center gap-2"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full font-bold transition-colors",
                step >= n
                  ? "bg-primary text-on-accent shadow-[0_0_15px_var(--color-glow)]"
                  : "bg-surface-variant text-on-surface-variant",
              )}
            >
              {n}
            </div>
            <span
              className={cn(
                "text-label-caps",
                step >= n ? "text-primary" : "text-on-surface-variant",
              )}
            >
              {n === 1 ? "Vos infos" : "Votre besoin"}
            </span>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="glass-card w-full rounded-xl p-6 md:p-10"
        noValidate
      >
        {step === 1 ? (
          <div className="space-y-stack-md">
            <div className="mb-stack-lg">
              <h2 className="text-headline-md text-on-surface mb-2">
                Commençons par vos informations
              </h2>
              <p className="text-on-surface-variant">
                Afin de préparer au mieux votre audit gratuit, nous avons besoin
                de quelques détails.
              </p>
            </div>

            <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
              <FormField
                label="Nom complet"
                htmlFor="fullName"
                error={errors.fullName?.message}
              >
                <Input
                  id="fullName"
                  placeholder="Jean Dupont"
                  {...register("fullName")}
                />
              </FormField>
              <FormField
                label="Entreprise"
                htmlFor="company"
                error={errors.company?.message}
              >
                <Input
                  id="company"
                  placeholder="Mon Entreprise S.A."
                  {...register("company")}
                />
              </FormField>
            </div>

            <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
              <FormField
                label="Téléphone"
                htmlFor="phone"
                error={errors.phone?.message}
              >
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  {...register("phone")}
                />
              </FormField>
              <FormField
                label="Email professionnel"
                htmlFor="email"
                error={errors.email?.message}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="jean@entreprise.cm"
                  {...register("email")}
                />
              </FormField>
            </div>

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

            <div className="pt-stack-md flex justify-end">
              <Button type="button" onClick={goNext}>
                Continuer
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-stack-md">
            <div className="mb-stack-lg">
              <h2 className="text-headline-md text-on-surface mb-2">
                Quel est votre besoin ?
              </h2>
              <p className="text-on-surface-variant">
                Sélectionnez les domaines où vous cherchez de
                l&rsquo;assistance.
              </p>
            </div>

            <FormField
              label="Service souhaité (plusieurs choix possibles)"
              htmlFor="servicesWanted"
              error={errors.servicesWanted?.message}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {AUDIT_SERVICES.map((service) => (
                  <Checkbox
                    key={service.value}
                    label={service.label}
                    description={service.description}
                    checked={servicesWanted.includes(service.value)}
                    onChange={() => toggleService(service.value)}
                  />
                ))}
              </div>
            </FormField>

            <FormField
              label="Créneau préféré"
              htmlFor="preferredSlot"
              error={errors.preferredSlot?.message}
            >
              <Select
                id="preferredSlot"
                defaultValue=""
                {...register("preferredSlot")}
              >
                <option value="" disabled>
                  Choisissez un moment
                </option>
                {PREFERRED_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Message (optionnel)"
              htmlFor="message"
              error={errors.message?.message}
            >
              <Textarea
                id="message"
                rows={3}
                placeholder="Décrivez brièvement votre situation actuelle"
                {...register("message")}
              />
            </FormField>

            {submitError ? (
              <p role="alert" className="text-error text-sm">
                {submitError}
              </p>
            ) : null}

            <div className="pt-stack-md flex items-center justify-between">
              <Button
                type="button"
                variant="tertiary"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Précédent
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Envoi..." : "Envoyer ma demande"}
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
