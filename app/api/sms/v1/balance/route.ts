import { authenticateSmsRequest } from "@/lib/sms/auth";
import { handleSmsRoute } from "@/lib/sms/route";

export async function GET(request: Request) {
  return handleSmsRoute(async () => {
    const caller = await authenticateSmsRequest(request, { forSending: false });
    return Response.json({
      credits: caller.account.creditBalance,
      accountStatus: caller.account.status.toLowerCase(),
      sender: {
        value: caller.senderId.value,
        status: caller.senderId.status.toLowerCase(),
      },
    });
  });
}
