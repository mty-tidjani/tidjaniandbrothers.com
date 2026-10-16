import {
  EXPORT_LIMIT,
  getPortalMessagesForExport,
} from "@/lib/data/sms-portal";
import { SMS_MESSAGE_STATUS_LABELS } from "@/lib/constants";
import { getPortalSession, PORTAL_LOGIN_PATH } from "@/lib/sms-portal/session";

function csvCell(value: string | number): string {
  const text = String(value);
  // Neutralise spreadsheet formula injection from message bodies.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n\r;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET(request: Request) {
  const session = await getPortalSession();
  if (!session) {
    return Response.redirect(new URL(PORTAL_LOGIN_PATH, request.url), 303);
  }

  const params = new URL(request.url).searchParams;
  const messages = await getPortalMessagesForExport(session.account.id, {
    status: params.get("status") ?? undefined,
    q: params.get("q") ?? undefined,
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
  });

  const header = [
    "date",
    "id",
    "expediteur",
    "destinataires",
    "nb_destinataires",
    "sms_par_destinataire",
    "encodage",
    "credits",
    "statut",
    "message",
  ];
  const lines = messages.map((m) =>
    [
      m.createdAt.toISOString(),
      m.id,
      m.senderValue,
      m.recipients.join(" "),
      m.recipients.length,
      m.parts,
      m.encoding,
      m.creditsCharged - m.creditsRefunded,
      SMS_MESSAGE_STATUS_LABELS[m.status] ?? m.status,
      m.body,
    ]
      .map(csvCell)
      .join(","),
  );
  if (messages.length === EXPORT_LIMIT) {
    lines.push(
      csvCell(`Export limité aux ${EXPORT_LIMIT} envois les plus récents`),
    );
  }

  // BOM so Excel opens UTF-8 accents correctly.
  const body = "﻿" + [header.join(","), ...lines].join("\r\n");
  const day = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="historique-sms-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
