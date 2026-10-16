"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/sms/admin";

type ActionFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  className?: string;
  children: React.ReactNode;
};

/** Server-action form with pending state and inline error/success feedback. */
export function ActionForm({ action, className, children }: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className={className}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {state.error ? (
        <p role="alert" className="text-error basis-full text-sm">
          {state.error}
        </p>
      ) : state.success ? (
        <p role="status" className="basis-full text-sm text-green-400">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
