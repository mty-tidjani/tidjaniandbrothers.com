"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  DEVIS_STEP_SCHEMAS,
  type DevisFullInput,
} from "@/lib/validation/devis";
import { getOrCreateDevisSessionId, clearDevisSession } from "@/lib/devis-session";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/forms/devis/StepProgress";
import { Step1InfosGenerales } from "@/components/forms/devis/steps/Step1InfosGenerales";
import { Step2SituationActuelle } from "@/components/forms/devis/steps/Step2SituationActuelle";
import { Step3BesoinsFonctionnels } from "@/components/forms/devis/steps/Step3BesoinsFonctionnels";
import { Step4Utilisateurs } from "@/components/forms/devis/steps/Step4Utilisateurs";
import { Step5DonneesAMigrer } from "@/components/forms/devis/steps/Step5DonneesAMigrer";
import { Step6Integrations } from "@/components/forms/devis/steps/Step6Integrations";
import { Step7Infrastructure } from "@/components/forms/devis/steps/Step7Infrastructure";
import { Step8DelaiBudget } from "@/components/forms/devis/steps/Step8DelaiBudget";
import { Step9Contact } from "@/components/forms/devis/steps/Step9Contact";

const TOTAL_STEPS = 9;

const STEP_LABELS = [
  "Informations générales",
  "Situation actuelle",
  "Besoins fonctionnels",
  "Utilisateurs",
  "Données à migrer",
  "Intégrations",
  "Infrastructure",
  "Délai et budget",
  "Contact",
];

const STEP_COMPONENTS = [
  Step1InfosGenerales,
  Step2SituationActuelle,
  Step3BesoinsFonctionnels,
  Step4Utilisateurs,
  Step5DonneesAMigrer,
  Step6Integrations,
  Step7Infrastructure,
  Step8DelaiBudget,
  Step9Contact,
];

const DEVIS_DEFAULT_VALUES: Partial<DevisFullInput> = {
  features: [],
  availableHardware: [],
};

export function DevisForm() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<DevisFullInput>({
    defaultValues: DEVIS_DEFAULT_VALUES,
  });
  const { getValues, setError, clearErrors, reset } = form;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let id = getOrCreateDevisSessionId();
      try {
        const res = await fetch(`/api/devis/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status !== "BROUILLON") {
            clearDevisSession();
            id = getOrCreateDevisSessionId();
          } else {
            const flattened = Object.values(
              data.answers ?? {},
            ).reduce<Record<string, unknown>>(
              (acc, section) => ({ ...acc, ...(section as object) }),
              {},
            );
            if (!cancelled) {
              reset({ ...DEVIS_DEFAULT_VALUES, ...flattened });
              setStep(
                Math.min(Math.max(data.currentStep ?? 1, 1), TOTAL_STEPS),
              );
            }
          }
        }
      } catch {
        // ignore — start with a fresh draft
      }
      if (!cancelled) setSessionId(id);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateStep = (index: number) => {
    const schema = DEVIS_STEP_SCHEMAS[index - 1];
    const result = schema.safeParse(getValues());
    clearErrors();
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof DevisFullInput;
        setError(field, { type: "manual", message: issue.message });
      }
      return null;
    }
    return result.data;
  };

  const autosave = (index: number, answers: Record<string, unknown>) => {
    if (!sessionId) return;
    fetch(`/api/devis/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: index, answers }),
    }).catch(() => {
      // silent autosave — no user-facing error
    });
  };

  const goNext = () => {
    const data = validateStep(step);
    if (!data) return;
    autosave(step, data);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const onFinalSubmit = async () => {
    const data = validateStep(TOTAL_STEPS);
    if (!data || !sessionId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await fetch(`/api/devis/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: TOTAL_STEPS, answers: data }),
      });
      const res = await fetch(`/api/devis/${sessionId}/submit`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Request failed");
      clearDevisSession();
      const company = getValues("companyName") ?? "";
      const params = new URLSearchParams({ company });
      router.push(`/demande-devis/merci?${params.toString()}`);
    } catch {
      setSubmitError("Une erreur est survenue, réessayez dans un instant.");
      setSubmitting(false);
    }
  };

  if (!sessionId) return null;

  const StepComponent = STEP_COMPONENTS[step - 1];

  return (
    <FormProvider {...form}>
      <div className="w-full max-w-3xl">
        <StepProgress
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          label={STEP_LABELS[step - 1]}
        />

        <div className="glass-card w-full rounded-xl p-6 md:p-10">
          <StepComponent />

          {step === TOTAL_STEPS && submitError ? (
            <p role="alert" className="text-error mt-4 text-sm">
              {submitError}
            </p>
          ) : null}

          <div className="pt-stack-md flex items-center justify-between">
            {step > 1 ? (
              <Button type="button" variant="tertiary" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Précédent
              </Button>
            ) : (
              <span />
            )}

            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={goNext}>
                Continuer
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                disabled={submitting}
                onClick={onFinalSubmit}
              >
                {submitting ? "Envoi..." : "Envoyer ma demande de devis"}
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
