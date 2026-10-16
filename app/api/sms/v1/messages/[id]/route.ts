import { prisma } from "@/lib/prisma";
import { authenticateSmsRequest } from "@/lib/sms/auth";
import { SmsApiError } from "@/lib/sms/errors";
import { toApiMessage } from "@/lib/sms/gateway";
import { handleSmsRoute } from "@/lib/sms/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleSmsRoute(async () => {
    const caller = await authenticateSmsRequest(request, { forSending: false });
    const { id } = await params;

    // Scoped to the caller's account: another customer's id is a 404.
    const message = await prisma.smsMessage.findFirst({
      where: { id, accountId: caller.account.id },
    });
    if (!message) {
      throw new SmsApiError("NOT_FOUND", "Message not found.");
    }
    return Response.json(toApiMessage(message));
  });
}
