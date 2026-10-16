"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { issuePortalAccessLink } from "@/lib/actions/sms-portal-admin";
import { smsSecondaryButton } from "@/components/admin/sms/buttons";

export function PortalAccessForm({
  accountId,
  hasPassword,
}: {
  accountId: string;
  hasPassword: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    issuePortalAccessLink,
    {},
  );
  const [copied, setCopied] = useState(false);
  const url = state.secret ? `${window.location.origin}${state.secret}` : null;

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction}>
        <input type="hidden" name="accountId" value={accountId} />
        <button type="submit" disabled={pending} className={smsSecondaryButton}>
          <Link2 className="mr-2 inline h-4 w-4" aria-hidden="true" />
          {hasPassword ? "Lien de réinitialisation" : "Générer un lien d'accès"}
        </button>
      </form>

      {state.error ? (
        <p role="alert" className="text-error text-sm">
          {state.error}
        </p>
      ) : null}

      {url ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="mb-2 text-sm text-amber-500">
            Envoyez ce lien au client (WhatsApp, email). Usage unique, valable 7
            jours. Il ne sera plus affiché.
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-surface-container text-on-surface flex-1 rounded px-3 py-2 font-mono text-xs break-all">
              {url}
            </code>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(url);
                setCopied(true);
              }}
              className="border-glass-stroke text-on-surface hover:text-primary rounded-lg border p-2"
              aria-label="Copier le lien"
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
