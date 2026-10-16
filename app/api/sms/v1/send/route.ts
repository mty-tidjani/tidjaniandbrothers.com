import { authenticateSmsRequest } from "@/lib/sms/auth";
import { SmsApiError } from "@/lib/sms/errors";
import { sendSms, toApiMessage } from "@/lib/sms/gateway";
import { handleSmsRoute } from "@/lib/sms/route";
import { sendSmsSchema } from "@/lib/validation/sms";

export async function POST(request: Request) {
  return handleSmsRoute(async () => {
    const caller = await authenticateSmsRequest(request, { forSending: true });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new SmsApiError("BAD_REQUEST", "Request body must be JSON.");
    }
    const parsed = sendSmsSchema.safeParse(body);
    if (!parsed.success) {
      throw new SmsApiError(
        "BAD_REQUEST",
        "Invalid request body.",
        parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      );
    }

    const { message, balance } = await sendSms(
      {
        accountId: caller.account.id,
        apiKeyId: caller.id,
        senderId: caller.senderId,
      },
      parsed.data,
    );
    const payload = { ...toApiMessage(message), balance };

    if (message.status === "FAILED") {
      const firstError = payload.batches.find((b) => b.error)?.error;
      return Response.json(
        {
          error: {
            code: firstError?.code ?? "UPSTREAM_UNAVAILABLE",
            message: "The message could not be sent. Credits were refunded.",
            details: payload,
          },
        },
        { status: firstError?.code === "UPSTREAM_UNAVAILABLE" ? 503 : 422 },
      );
    }
    return Response.json(payload, { status: 201 });
  });
}
