import type { SmsSenderIdStatus } from "@prisma/client";

export type SenderIdAction = "approve" | "reject" | "block" | "unblock";

// Which statuses each action may be applied from, and where it leads.
// Blocking works from any status, so a name can be banned pre-emptively and
// stays reserved (values are unique) so nobody else can register it.
export const SENDER_ID_TRANSITIONS: Record<
  SenderIdAction,
  { from: SmsSenderIdStatus[]; to: SmsSenderIdStatus; label: string }
> = {
  approve: {
    from: ["PENDING_REVIEW", "REJECTED"],
    to: "APPROVED",
    label: "Approuver",
  },
  reject: { from: ["PENDING_REVIEW"], to: "REJECTED", label: "Rejeter" },
  block: {
    from: ["PENDING_REVIEW", "APPROVED", "REJECTED"],
    to: "BLOCKED",
    label: "Bloquer",
  },
  unblock: { from: ["BLOCKED"], to: "APPROVED", label: "Débloquer" },
};

export function availableSenderActions(status: string): SenderIdAction[] {
  return (Object.keys(SENDER_ID_TRANSITIONS) as SenderIdAction[]).filter(
    (action) =>
      SENDER_ID_TRANSITIONS[action].from.includes(status as SmsSenderIdStatus),
  );
}
