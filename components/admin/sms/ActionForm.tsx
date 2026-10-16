"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/lib/sms/admin";

type ActionFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  className?: string;
  /** Asks the browser to confirm before submitting (destructive actions). */
  confirmMessage?: string;
  children: React.ReactNode;
};

/**
 * Server-action form with pending state and inline error/success feedback.
 * Unlike a bare `<form action>`, it keeps what the user typed when the
 * action returns an error, and only clears the fields on success.
 */
export function ActionForm({
  action,
  className,
  confirmMessage,
  children,
}: ActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      // Kept for submissions before hydration.
      action={formAction}
      onSubmit={(event) => {
        event.preventDefault();
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className={className}
    >
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {state.error ? (
        <p role="alert" className="text-error basis-full text-sm">
          {state.error}
        </p>
      ) : state.success ? (
        <p
          role="status"
          className="basis-full text-sm text-green-700 dark:text-green-400"
        >
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
