// STUB — no alerting channel wired up yet.
// TODO: send these to an ops inbox / WhatsApp / pager. Codes 00 (bad 1s2u
// credentials) and 0020 (our 1s2u balance is empty) mean the SMS service is
// down for EVERY customer and need a human immediately.
export async function notifySmsOpsAlert(alert: {
  upstreamCode: string;
  description: string;
  accountId: string;
  messageId: string;
}): Promise<void> {
  console.error(
    `[sms-alert] 1s2u ${alert.upstreamCode}: ${alert.description} (compte ${alert.accountId}, message ${alert.messageId})`,
  );
}
