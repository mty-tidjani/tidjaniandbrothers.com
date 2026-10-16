import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ActionForm } from "@/components/admin/sms/ActionForm";
import { smsSecondaryButton } from "@/components/admin/sms/buttons";
import { updateSenderIdStatus } from "@/lib/actions/sms-sender-ids";
import {
  availableSenderActions,
  SENDER_ID_TRANSITIONS,
} from "@/lib/sms/sender-transitions";

export function SenderIdActions({
  senderIdId,
  status,
}: {
  senderIdId: string;
  status: string;
}) {
  const actions = availableSenderActions(status);
  if (actions.length === 0) return null;

  return (
    <ActionForm
      action={updateSenderIdStatus}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="senderIdId" value={senderIdId} />
      <Select name="action" className="min-w-[130px] py-2 text-sm">
        {actions.map((action) => (
          <option key={action} value={action}>
            {SENDER_ID_TRANSITIONS[action].label}
          </option>
        ))}
      </Select>
      <Input
        name="reason"
        placeholder="Motif (requis pour rejeter/bloquer)"
        className="min-w-[200px] flex-1 py-2 text-sm"
      />
      <button type="submit" className={smsSecondaryButton}>
        Appliquer
      </button>
    </ActionForm>
  );
}
