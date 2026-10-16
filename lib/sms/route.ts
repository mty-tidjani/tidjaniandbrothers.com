import { SmsApiError, smsErrorResponse } from "@/lib/sms/errors";

/** Shared error boundary for /api/sms/v1 route handlers. */
export async function handleSmsRoute(
  run: () => Promise<Response>,
): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof SmsApiError) return smsErrorResponse(error);
    console.error("[sms] unhandled error", error);
    return smsErrorResponse(
      new SmsApiError("INTERNAL_ERROR", "Something went wrong on our side."),
    );
  }
}
