"use client";

import { useRef, useTransition } from "react";
import { Select } from "@/components/ui/Select";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from "@/lib/constants";
import { updateLeadStatus } from "@/lib/actions/leads";

export function StatusSelectForm({
  leadId,
  status,
}: {
  leadId: string;
  status: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => startTransition(() => updateLeadStatus(formData))}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="leadId" value={leadId} />
      <Select
        key={status}
        name="status"
        defaultValue={status}
        disabled={isPending}
        onChange={() => formRef.current?.requestSubmit()}
      >
        {LEAD_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {LEAD_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      {isPending ? (
        <p className="text-on-surface-variant text-sm">Mise à jour...</p>
      ) : null}
    </form>
  );
}
