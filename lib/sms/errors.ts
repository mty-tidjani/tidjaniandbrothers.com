// Stable, customer-facing error codes for /api/sms/v1. Never leak raw 1s2u
// codes or messages: some of them describe *our* account, not the customer's.
export type SmsApiErrorCode =
  | "UNAUTHORIZED"
  | "ACCOUNT_INACTIVE"
  | "SENDER_ID_BLOCKED"
  | "SENDER_ID_NOT_APPROVED"
  | "BAD_REQUEST"
  | "INVALID_RECIPIENT"
  | "UNSUPPORTED_DESTINATION"
  | "MESSAGE_TOO_LONG"
  | "INSUFFICIENT_CREDIT"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "SENDER_ID_REJECTED"
  | "NETWORK_NOT_SUPPORTED"
  | "INVALID_MESSAGE"
  | "UPSTREAM_UNAVAILABLE"
  | "INTERNAL_ERROR";

export const SMS_API_ERROR_STATUS: Record<SmsApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  ACCOUNT_INACTIVE: 403,
  SENDER_ID_BLOCKED: 403,
  SENDER_ID_NOT_APPROVED: 403,
  BAD_REQUEST: 400,
  INVALID_RECIPIENT: 422,
  UNSUPPORTED_DESTINATION: 422,
  MESSAGE_TOO_LONG: 422,
  INSUFFICIENT_CREDIT: 402,
  RATE_LIMITED: 429,
  NOT_FOUND: 404,
  SENDER_ID_REJECTED: 422,
  NETWORK_NOT_SUPPORTED: 422,
  INVALID_MESSAGE: 422,
  UPSTREAM_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export class SmsApiError extends Error {
  constructor(
    public readonly code: SmsApiErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "SmsApiError";
  }

  get status(): number {
    return SMS_API_ERROR_STATUS[this.code];
  }
}

export function smsErrorResponse(error: SmsApiError): Response {
  return Response.json(
    {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    },
    { status: error.status },
  );
}

type UpstreamErrorInfo = {
  description: string;
  customerCode: SmsApiErrorCode;
  /** Our own account/integration is broken — page ops, not the customer. */
  alertOps: boolean;
  /** Safe to retry the same batch later. */
  retryable: boolean;
};

// Error codes from the 1s2u HTTP API reference.
export const UPSTREAM_ERRORS: Record<string, UpstreamErrorInfo> = {
  "0000": {
    description: "Service temporarily unavailable",
    customerCode: "UPSTREAM_UNAVAILABLE",
    alertOps: false,
    retryable: true,
  },
  "000": {
    description: "Missing required parameter",
    customerCode: "INTERNAL_ERROR",
    alertOps: true,
    retryable: false,
  },
  "00": {
    description: "Invalid 1s2u credentials or trial expired",
    customerCode: "UPSTREAM_UNAVAILABLE",
    alertOps: true,
    retryable: true,
  },
  "0020": {
    description: "Insufficient credit on our 1s2u account",
    customerCode: "UPSTREAM_UNAVAILABLE",
    alertOps: true,
    retryable: true,
  },
  "0030": {
    description: "Invalid sender name",
    customerCode: "SENDER_ID_REJECTED",
    alertOps: true,
    retryable: false,
  },
  "0041": {
    description: "Invalid mobile number",
    customerCode: "INVALID_RECIPIENT",
    alertOps: false,
    retryable: false,
  },
  "0042": {
    description: "Network not supported/activated",
    customerCode: "NETWORK_NOT_SUPPORTED",
    alertOps: false,
    retryable: false,
  },
  "0050": {
    description: "Invalid SMS text",
    customerCode: "INVALID_MESSAGE",
    alertOps: false,
    retryable: false,
  },
  "0051": {
    description: "Invalid message type",
    customerCode: "INTERNAL_ERROR",
    alertOps: true,
    retryable: false,
  },
  "0060": {
    description: "Invalid submission limit",
    customerCode: "INTERNAL_ERROR",
    alertOps: true,
    retryable: false,
  },
  // Transport-level failures reported by lib/sms/client.ts.
  NETWORK: {
    description: "Could not reach 1s2u (timeout or network error)",
    customerCode: "UPSTREAM_UNAVAILABLE",
    alertOps: false,
    retryable: true,
  },
  HTTP_429: {
    description: "1s2u rate limit hit despite our outbound throttle",
    customerCode: "UPSTREAM_UNAVAILABLE",
    alertOps: true,
    retryable: true,
  },
};

export const UNKNOWN_UPSTREAM_ERROR: UpstreamErrorInfo = {
  description: "Unrecognised response from 1s2u",
  customerCode: "UPSTREAM_UNAVAILABLE",
  alertOps: true,
  retryable: true,
};
