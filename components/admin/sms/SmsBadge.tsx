import { cn } from "@/lib/utils";
import {
  SMS_ACCOUNT_STATUS_LABELS,
  SMS_ACCOUNT_STATUS_STYLES,
  SMS_MESSAGE_STATUS_LABELS,
  SMS_MESSAGE_STATUS_STYLES,
  SMS_SENDER_ID_STATUS_LABELS,
  SMS_SENDER_ID_STATUS_STYLES,
} from "@/lib/constants";

const KINDS = {
  account: [SMS_ACCOUNT_STATUS_LABELS, SMS_ACCOUNT_STATUS_STYLES],
  sender: [SMS_SENDER_ID_STATUS_LABELS, SMS_SENDER_ID_STATUS_STYLES],
  message: [SMS_MESSAGE_STATUS_LABELS, SMS_MESSAGE_STATUS_STYLES],
} as const;

export const SmsBadge = ({
  kind,
  status,
}: {
  kind: keyof typeof KINDS;
  status: string;
}) => {
  const [labels, styles] = KINDS[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold tracking-wider whitespace-nowrap uppercase",
        styles[status] ??
          "bg-surface-variant text-on-surface-variant border-outline-variant",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] ?? status}
    </span>
  );
};
