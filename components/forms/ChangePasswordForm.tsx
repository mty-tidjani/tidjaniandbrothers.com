"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { changeOwnPassword } from "@/lib/actions/settings";

type State = { ok: boolean; error?: string } | null;

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prev, formData) => changeOwnPassword(formData),
    null,
  );

  return (
    <form action={formAction} className="gap-stack-md flex flex-col">
      <FormField label="Mot de passe actuel" htmlFor="currentPassword">
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
        />
      </FormField>
      <FormField label="Nouveau mot de passe" htmlFor="newPassword">
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
        />
      </FormField>
      <FormField
        label="Confirmer le nouveau mot de passe"
        htmlFor="confirmPassword"
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
        />
      </FormField>

      {state?.error ? (
        <p role="alert" className="text-error text-sm">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-primary text-sm">Mot de passe mis à jour.</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
