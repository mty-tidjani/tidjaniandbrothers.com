"use client";

import { useActionState, useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { issueApiKey } from "@/lib/actions/sms-api-keys";
import { smsPrimaryButton } from "@/components/admin/sms/buttons";

type SenderOption = { id: string; value: string; status: string };

export function IssueApiKeyForm({ senders }: { senders: SenderOption[] }) {
  const [state, formAction, pending] = useActionState(issueApiKey, {});
  const [copied, setCopied] = useState(false);

  if (senders.length === 0) {
    return (
      <p className="text-on-surface-variant text-sm">
        Ajoutez d&rsquo;abord un nom d&rsquo;expéditeur : chaque clé est liée à
        un seul expéditeur.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <Input
          name="label"
          placeholder="Libellé (ex. Production)"
          required
          className="flex-1"
        />
        <Select name="senderIdId" required className="sm:w-48">
          {senders.map((sender) => (
            <option key={sender.id} value={sender.id}>
              {sender.value}
              {sender.status === "APPROVED" ? "" : " (non approuvé)"}
            </option>
          ))}
        </Select>
        <button type="submit" disabled={pending} className={smsPrimaryButton}>
          <KeyRound className="mr-2 inline h-4 w-4" aria-hidden="true" />
          Générer
        </button>
      </form>

      {state.error ? (
        <p role="alert" className="text-error text-sm">
          {state.error}
        </p>
      ) : null}

      {state.secret ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="mb-2 text-sm font-bold text-amber-500">
            Copiez cette clé maintenant : elle ne sera plus jamais affichée.
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-surface-container text-on-surface flex-1 overflow-x-auto rounded px-3 py-2 font-mono text-sm break-all">
              {state.secret}
            </code>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(state.secret!);
                setCopied(true);
              }}
              className="border-glass-stroke text-on-surface hover:text-primary rounded-lg border p-2"
              aria-label="Copier la clé"
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
