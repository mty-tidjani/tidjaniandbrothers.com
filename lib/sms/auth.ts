import { prisma } from "@/lib/prisma";
import { SmsApiError } from "@/lib/sms/errors";
import { extractApiKey, hashApiKey } from "@/lib/sms/keys";
import { allowKeyRequest } from "@/lib/sms/rate-limit";

export type SmsCaller = NonNullable<Awaited<ReturnType<typeof findKey>>>;

function findKey(keyHash: string) {
  return prisma.smsApiKey.findUnique({
    where: { keyHash },
    include: {
      account: { select: { id: true, status: true, creditBalance: true } },
      senderId: { select: { id: true, value: true, status: true } },
    },
  });
}

/**
 * Resolves the API key on every request — account and sender ID status are
 * re-read each time so an admin suspension or SID ban takes effect on the
 * very next call.
 *
 * `forSending: false` is for read-only endpoints (balance, message status):
 * a suspended account or blocked sender can still see why it can't send.
 */
export async function authenticateSmsRequest(
  request: Request,
  { forSending }: { forSending: boolean },
) {
  const secret = extractApiKey(request);
  if (!secret) {
    throw new SmsApiError(
      "UNAUTHORIZED",
      "Missing API key. Send it as 'Authorization: Bearer <key>'.",
    );
  }

  const key = await findKey(hashApiKey(secret));
  if (!key || key.revokedAt) {
    throw new SmsApiError("UNAUTHORIZED", "Invalid or revoked API key.");
  }
  if (!allowKeyRequest(key.id)) {
    throw new SmsApiError("RATE_LIMITED", "Too many requests, slow down.");
  }
  if (key.account.status === "DISABLED") {
    throw new SmsApiError("ACCOUNT_INACTIVE", "This account is disabled.");
  }

  if (forSending) {
    if (key.account.status !== "ACTIVE") {
      throw new SmsApiError(
        "ACCOUNT_INACTIVE",
        "This account is not active. Contact support.",
      );
    }
    if (key.senderId.status === "BLOCKED") {
      throw new SmsApiError(
        "SENDER_ID_BLOCKED",
        `Sender ID '${key.senderId.value}' has been blocked.`,
      );
    }
    if (key.senderId.status !== "APPROVED") {
      throw new SmsApiError(
        "SENDER_ID_NOT_APPROVED",
        `Sender ID '${key.senderId.value}' is not approved yet.`,
      );
    }
  }

  // Coarse on purpose: avoid a write per request under load.
  if (!key.lastUsedAt || Date.now() - key.lastUsedAt.getTime() > 60_000) {
    void prisma.smsApiKey
      .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
      .catch(() => {});
  }

  return key;
}
