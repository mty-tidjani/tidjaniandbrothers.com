"use client";

import { useRef, useTransition } from "react";
import { Select } from "@/components/ui/Select";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_ORDER } from "@/lib/constants";
import { updateDevisStatus } from "@/lib/actions/devis";

export function DevisStatusSelectForm({
  devisId,
  status,
}: {
  devisId: string;
  status: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => startTransition(() => updateDevisStatus(formData))}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="devisId" value={devisId} />
      <Select
        key={status}
        name="status"
        defaultValue={status}
        disabled={isPending}
        onChange={() => formRef.current?.requestSubmit()}
      >
        {QUOTE_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {QUOTE_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      {isPending ? (
        <p className="text-on-surface-variant text-sm">Mise à jour...</p>
      ) : null}
    </form>
  );
}
