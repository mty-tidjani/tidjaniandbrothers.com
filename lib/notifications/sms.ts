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

// STUB — same as above: tell the sales team a customer signed up from the
// portal and is waiting for activation + a first recharge.
export async function notifySmsSignup(account: {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
}): Promise<void> {
  console.info(
    `[sms-signup] Nouveau compte SMS en attente : ${account.companyName} (${account.contactEmail}, ${account.contactPhone}) — /admin/sms/${account.id}`,
  );
}
