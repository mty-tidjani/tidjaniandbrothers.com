import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DEVIS_STEP_SCHEMAS,
  DEVIS_STEP_SECTION_KEYS,
} from "@/lib/validation/devis";
import { notifyDevisSubmitted } from "@/lib/notifications/devis";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const existing = await prisma.quoteRequest.findUnique({
    where: { sessionId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  if (existing.status !== "BROUILLON") {
    return NextResponse.json({ id: existing.id, status: "soumis" });
  }

  const answers = (existing.answers as Record<string, unknown>) ?? {};
  const missingOrInvalid = DEVIS_STEP_SECTION_KEYS.some((key, index) => {
    const schema = DEVIS_STEP_SCHEMAS[index];
    return !schema.safeParse(answers[key]).success;
  });
  if (missingOrInvalid) {
    return NextResponse.json(
      { error: "Le formulaire de devis est incomplet" },
      { status: 422 },
    );
  }

  const [quote] = await prisma.$transaction([
    prisma.quoteRequest.update({
      where: { sessionId },
      data: { status: "SOUMIS", submittedAt: new Date() },
    }),
    prisma.quoteStatusEvent.create({
      data: {
        quoteId: existing.id,
        fromStatus: "BROUILLON",
        toStatus: "SOUMIS",
      },
    }),
  ]);

  try {
    await notifyDevisSubmitted(quote);
  } catch {
    // best-effort — never block submission on notification failure
  }

  return NextResponse.json({ id: quote.id, status: "soumis" });
}
