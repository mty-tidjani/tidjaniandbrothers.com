import type { SmsMessage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  sendViaUpstream,
  UPSTREAM_MAX_RECIPIENTS,
  type UpstreamResult,
  type UpstreamSendInput,
} from "@/lib/sms/client";
import { applyCreditChange } from "@/lib/sms/credits";
import {
  SmsApiError,
  UNKNOWN_UPSTREAM_ERROR,
  UPSTREAM_ERRORS,
} from "@/lib/sms/errors";
import { getActiveRates, quote } from "@/lib/sms/pricing";
import { acquireUpstreamSlot } from "@/lib/sms/rate-limit";
import { isGsm7, MAX_PARTS, maxUnits, segment } from "@/lib/sms/segmentation";
import { notifySmsOpsAlert } from "@/lib/notifications/sms";
import { normalizeRecipient, type SendSmsInput } from "@/lib/validation/sms";

// Upstream codes worth one immediate retry. NETWORK is deliberately absent:
// a timeout may still have been delivered, and a retry would double-send.
const RETRY_NOW = new Set(["0000", "HTTP_429"]);

/**
 * Who is sending. Built from an API key (public API) or from a portal
 * session (web form, `apiKeyId: null`). Callers must have already checked
 * that the sender ID is APPROVED and belongs to the account; the credit
 * debit below re-checks that the account is ACTIVE.
 */
export type SendContext = {
  accountId: string;
  apiKeyId: string | null;
  senderId: { id: string; value: string };
};

type BatchRecord = {
  recipients: string[];
  ok: boolean;
  upstreamIds: string[];
  upstreamCode?: string;
};

function upstreamErrorInfo(code: string) {
  return UPSTREAM_ERRORS[code] ?? UNKNOWN_UPSTREAM_ERROR;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function sendBatch(input: UpstreamSendInput): Promise<UpstreamResult> {
  for (let attempt = 1; ; attempt++) {
    await acquireUpstreamSlot();
    let result: UpstreamResult;
    try {
      result = await sendViaUpstream(input);
    } catch (error) {
      // Missing env config or a programming error — never a customer issue.
      console.error("[sms] upstream call threw", error);
      return { ok: false, code: "CLIENT_ERROR", raw: "" };
    }
    if (result.ok || attempt >= 2 || !RETRY_NOW.has(result.code)) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

function prepare(input: SendSmsInput) {
  const invalid: string[] = [];
  const recipients: string[] = [];
  const seen = new Set<string>();
  for (const raw of input.to) {
    const number = normalizeRecipient(raw);
    if (!number) invalid.push(raw);
    else if (!seen.has(number)) {
      seen.add(number);
      recipients.push(number);
    }
  }
  if (invalid.length > 0) {
    throw new SmsApiError(
      "INVALID_RECIPIENT",
      "Some recipient numbers are invalid. Use international format, e.g. 2376XXXXXXXX.",
      { invalid },
    );
  }

  if (input.encoding === "gsm7" && !isGsm7(input.message)) {
    throw new SmsApiError(
      "BAD_REQUEST",
      "Message contains characters outside the GSM-7 alphabet. Use encoding 'auto' or 'unicode'.",
    );
  }
  const segmentation = segment(input.message, input.encoding);
  if (segmentation.parts > MAX_PARTS) {
    throw new SmsApiError(
      "MESSAGE_TOO_LONG",
      `Message is ${segmentation.parts} parts long; the maximum is ${MAX_PARTS}.`,
      {
        parts: segmentation.parts,
        maxParts: MAX_PARTS,
        maxLength: maxUnits(segmentation.encoding),
        encoding: segmentation.encoding.toLowerCase(),
      },
    );
  }

  return { recipients, segmentation };
}

export async function sendSms(caller: SendContext, input: SendSmsInput) {
  const { recipients, segmentation } = prepare(input);

  const priced = quote(recipients, segmentation.parts, await getActiveRates());
  if (priced.unsupported.length > 0) {
    throw new SmsApiError(
      "UNSUPPORTED_DESTINATION",
      "We don't deliver to some of these destinations yet.",
      { numbers: priced.unsupported },
    );
  }

  // Reserve credits up front so we never pay 1s2u for a send we can't bill.
  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.smsMessage.create({
      data: {
        accountId: caller.accountId,
        apiKeyId: caller.apiKeyId,
        senderIdId: caller.senderId.id,
        senderValue: caller.senderId.value,
        recipients,
        body: input.message,
        encoding: segmentation.encoding,
        parts: segmentation.parts,
        creditsCharged: priced.credits,
      },
    });
    const balance = await applyCreditChange(tx, {
      accountId: caller.accountId,
      credits: -priced.credits,
      type: "DEBIT",
      messageId: created.id,
      onlyIfActive: true,
    });
    if (balance === null) {
      throw new SmsApiError("INSUFFICIENT_CREDIT", "Not enough credit.", {
        required: priced.credits,
      });
    }
    return created;
  });

  const batches = chunk(recipients, UPSTREAM_MAX_RECIPIENTS);
  const results = await Promise.all(
    batches.map((batch) =>
      sendBatch({
        sender: caller.senderId.value,
        recipients: batch,
        body: input.message,
        encoding: segmentation.encoding,
      }),
    ),
  );

  const records: BatchRecord[] = batches.map((batch, i) => {
    const result = results[i];
    return result.ok
      ? { recipients: batch, ok: true, upstreamIds: result.messageIds }
      : {
          recipients: batch,
          ok: false,
          upstreamIds: [],
          upstreamCode: result.code,
        };
  });

  let refund = 0;
  let upstreamCostFcfa = 0;
  for (const record of records) {
    for (const number of record.recipients) {
      const price = priced.perRecipient.get(number)!;
      if (record.ok) upstreamCostFcfa += price.costFcfa;
      else refund += price.credits;
    }
  }

  const okCount = records.filter((r) => r.ok).length;
  const status =
    okCount === records.length ? "SENT" : okCount === 0 ? "FAILED" : "PARTIAL";
  const firstError = records.find((r) => !r.ok)?.upstreamCode ?? null;

  const updated = await prisma.$transaction(async (tx) => {
    if (refund > 0) {
      await applyCreditChange(tx, {
        accountId: caller.accountId,
        credits: refund,
        type: "REFUND",
        messageId: message.id,
        note: `Échec 1s2u (${firstError})`,
      });
    }
    return tx.smsMessage.update({
      where: { id: message.id },
      data: {
        status,
        creditsRefunded: refund,
        upstreamCostFcfa,
        upstreamMessageIds: records.flatMap((r) => r.upstreamIds),
        errorCode: firstError,
        batches: records,
      },
    });
  });

  await handleUpstreamFailures(caller, message.id, records);

  const { creditBalance } = await prisma.smsAccount.findUniqueOrThrow({
    where: { id: caller.accountId },
    select: { creditBalance: true },
  });
  return { message: updated, balance: creditBalance };
}

async function handleUpstreamFailures(
  caller: SendContext,
  messageId: string,
  records: BatchRecord[],
) {
  const codes = new Set(
    records.filter((r) => !r.ok).map((r) => r.upstreamCode!),
  );

  for (const code of codes) {
    const info = upstreamErrorInfo(code);
    if (info.alertOps) {
      await notifySmsOpsAlert({
        upstreamCode: code,
        description: info.description,
        accountId: caller.accountId,
        messageId,
      });
    }
  }

  // 1s2u refused a sender name we had approved: send it back to review so
  // an admin looks at it instead of the customer failing silently forever.
  if (codes.has("0030")) {
    const { count } = await prisma.smsSenderId.updateMany({
      where: { id: caller.senderId.id, status: "APPROVED" },
      data: {
        status: "PENDING_REVIEW",
        statusReason: "Refusé par 1s2u (code 0030)",
      },
    });
    if (count > 0) {
      await prisma.smsSenderIdStatusEvent.create({
        data: {
          senderIdId: caller.senderId.id,
          fromStatus: "APPROVED",
          toStatus: "PENDING_REVIEW",
          reason: "Refusé par 1s2u (code 0030)",
        },
      });
    }
  }
}

/** Customer-facing shape of a message. Never exposes raw 1s2u codes. */
export function toApiMessage(message: SmsMessage) {
  const batches = message.batches as BatchRecord[];
  const customerError = (code: string | null | undefined) => {
    if (!code) return undefined;
    const info = upstreamErrorInfo(code);
    return {
      code: info.customerCode,
      retryable: info.retryable,
    };
  };

  return {
    id: message.id,
    status: message.status.toLowerCase(),
    sender: message.senderValue,
    encoding: message.encoding.toLowerCase(),
    parts: message.parts,
    recipients: message.recipients.length,
    creditsCharged: message.creditsCharged - message.creditsRefunded,
    creditsRefunded: message.creditsRefunded,
    createdAt: message.createdAt.toISOString(),
    batches: batches.map((batch) => ({
      recipients: batch.recipients,
      status: batch.ok ? "submitted" : "failed",
      error: customerError(batch.upstreamCode),
    })),
  };
}
