"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Input";
import { smsPrimaryButton } from "@/components/admin/sms/buttons";
import { sendPortalSms } from "@/lib/actions/sms-portal";
import { MAX_PARTS, maxUnits, segment } from "@/lib/sms/segmentation";
import { normalizeRecipient } from "@/lib/validation/sms";
import { splitRecipients } from "@/lib/validation/sms-portal";

type Sender = { id: string; value: string };

export function MessageComposer({
  senders,
  balance,
}: {
  senders: Sender[];
  balance: number;
}) {
  const [state, formAction, pending] = useActionState(sendPortalSms, {});
  const [message, setMessage] = useState("");
  const [to, setTo] = useState("");

  const seg = segment(message);
  // Same normalisation + dedupe as the server, so "+237 670…" and "237670…"
  // count once.
  const recipients = new Set(
    splitRecipients(to).map((n) => normalizeRecipient(n) ?? n),
  ).size;
  // Exact for Cameroon (1 credit / SMS); the server re-prices every number.
  const estimate = recipients * (message ? seg.parts : 0);
  const tooLong = seg.parts > MAX_PARTS;

  return (
    <form action={formAction} className="gap-stack-md flex flex-col">
      <FormField label="Expéditeur" htmlFor="senderIdId">
        <Select id="senderIdId" name="senderIdId" required>
          {senders.map((s) => (
            <option key={s.id} value={s.id}>
              {s.value}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Destinataires" htmlFor="to">
        <Textarea
          id="to"
          name="to"
          rows={4}
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={"237670000000\n237650000000"}
          className="font-mono text-sm"
        />
        <p className="text-on-surface-variant text-sm">
          Un numéro par ligne (ou séparés par des virgules), format
          international : 237 suivi des 9 chiffres. 300 numéros maximum.
        </p>
      </FormField>

      <FormField label="Message" htmlFor="message">
        <Textarea
          id="message"
          name="message"
          rows={5}
          required
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p
          className={`text-sm ${tooLong ? "text-error" : "text-on-surface-variant"}`}
          aria-live="polite"
        >
          {seg.units} / {maxUnits(seg.encoding)} caractères · {seg.parts} SMS ·{" "}
          {seg.encoding === "UNICODE"
            ? "Unicode (accents comme ê, ç ou emojis : 70 caractères par SMS)"
            : "standard (160 caractères par SMS)"}
        </p>
      </FormField>

      <div className="border-glass-stroke bg-surface-container/50 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
        <p className="text-on-surface text-sm">
          Coût estimé :{" "}
          <strong>
            {estimate} crédit{estimate > 1 ? "s" : ""}
          </strong>
          <span className="text-on-surface-variant">
            {" "}
            · solde {new Intl.NumberFormat("fr-FR").format(balance)}
          </span>
        </p>
        <button
          type="submit"
          disabled={pending || tooLong || estimate > balance}
          className={smsPrimaryButton}
        >
          <Send className="mr-2 inline h-4 w-4" aria-hidden="true" />
          {pending ? "Envoi..." : "Envoyer"}
        </button>
      </div>

      {state.error ? (
        <p role="alert" className="text-error text-sm">
          {state.error}
        </p>
      ) : state.success ? (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
