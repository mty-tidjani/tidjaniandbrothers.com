import { toUcs2Hex, type SmsEncoding } from "@/lib/sms/segmentation";

// Thin wrapper over the 1s2u HTTP API. Holds OUR master credentials, so it
// must only ever be called from lib/sms/gateway.ts — never from a route
// handler or anything that could echo its inputs back to a customer.

const DEFAULT_BASE_URL = "https://api.1s2u.io/bulksms";
const TIMEOUT_MS = 15_000;

// 1s2u's documented per-request recipient cap.
export const UPSTREAM_MAX_RECIPIENTS = 30;

export type UpstreamSendInput = {
  sender: string;
  recipients: string[];
  body: string;
  encoding: SmsEncoding;
};

export type UpstreamResult =
  | { ok: true; messageIds: string[]; raw: string }
  | { ok: false; code: string; raw: string };

function config() {
  const username = process.env.SMS_PROVIDER_USERNAME;
  const password = process.env.SMS_PROVIDER_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "SMS_PROVIDER_USERNAME / SMS_PROVIDER_PASSWORD are not set",
    );
  }
  return {
    baseUrl: process.env.SMS_PROVIDER_BASE_URL || DEFAULT_BASE_URL,
    username,
    password,
  };
}

/**
 * Responses look like "OK: 760d54eb-..." on success and "ERROR: 0041" (or a
 * bare code) on failure. We only trust the leading OK; anything else is an
 * error and we pull out whichever documented code it contains.
 */
export function parseUpstreamResponse(raw: string): UpstreamResult {
  const text = raw.trim();
  if (/^OK\b/i.test(text)) {
    const messageIds = text
      .replace(/^OK\s*:?\s*/i, "")
      .split(/[\s,;]+/)
      .filter(Boolean);
    return { ok: true, messageIds, raw: text };
  }
  const code = text.replace(/^ERROR\s*:?\s*/i, "").match(/^\d{2,4}\b/)?.[0];
  return { ok: false, code: code ?? "UNKNOWN", raw: text };
}

export async function sendViaUpstream(
  input: UpstreamSendInput,
): Promise<UpstreamResult> {
  if (input.recipients.length > UPSTREAM_MAX_RECIPIENTS) {
    throw new Error(
      `At most ${UPSTREAM_MAX_RECIPIENTS} recipients per upstream call`,
    );
  }

  const { baseUrl, username, password } = config();
  const params = new URLSearchParams({
    username,
    password,
    mt: input.encoding === "UNICODE" ? "1" : "0",
    sid: input.sender,
    mno: input.recipients.join(","),
    msg: input.encoding === "UNICODE" ? toUcs2Hex(input.body) : input.body,
  });

  // Every example in the 1s2u reference uses GET. The URL carries our
  // password, so it is never logged.
  let response: Response;
  try {
    response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return { ok: false, code: "NETWORK", raw: "" };
  }

  if (response.status === 429) {
    return { ok: false, code: "HTTP_429", raw: "" };
  }
  const raw = await response.text();
  if (!response.ok) {
    return { ok: false, code: `HTTP_${response.status}`, raw };
  }
  return parseUpstreamResponse(raw);
}
