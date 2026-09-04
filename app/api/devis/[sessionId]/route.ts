import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEVIS_STEP_SCHEMAS,
  DEVIS_STEP_SECTION_KEYS,
} from "@/lib/validation/devis";

type PromotedFields = {
  companyName?: string;
  budgetMentioned?: string | null;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
};

function promotedFields(
  step: number,
  data: Record<string, unknown>,
): PromotedFields {
  if (step === 1) return { companyName: data.companyName as string };
  if (step === 8) return { budgetMentioned: (data.budget as string) || null };
  if (step === 9) {
    return {
      contactName: data.contactName as string,
      contactPhone: data.contactPhone as string,
      contactEmail: data.contactEmail as string,
    };
  }
  return {};
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const quote = await prisma.quoteRequest.findUnique({ where: { sessionId } });
  if (!quote) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json({
    status: quote.status,
    currentStep: quote.currentStep,
    answers: quote.answers,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("step" in body) ||
    typeof body.step !== "number" ||
    body.step < 1 ||
    body.step > DEVIS_STEP_SCHEMAS.length ||
    !("answers" in body)
  ) {
    return NextResponse.json(
      { error: "Requête invalide" },
      { status: 400 },
    );
  }

  const { step, answers } = body as { step: number; answers: unknown };
  const schema = DEVIS_STEP_SCHEMAS[step - 1];
  const parsed = schema.safeParse(answers);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Étape invalide", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const existing = await prisma.quoteRequest.findUnique({
    where: { sessionId },
  });

  if (existing && existing.status !== "BROUILLON") {
    return NextResponse.json(
      { error: "Cette demande de devis a déjà été soumise" },
      { status: 409 },
    );
  }

  const sectionKey = DEVIS_STEP_SECTION_KEYS[step - 1];
  const existingAnswers = (existing?.answers as Record<string, unknown>) ?? {};
  const mergedAnswers = {
    ...existingAnswers,
    [sectionKey]: parsed.data,
  } as Prisma.InputJsonObject;
  const currentStep = Math.max(existing?.currentStep ?? 0, step);
  const promoted = promotedFields(
    step,
    parsed.data as Record<string, unknown>,
  );

  let quote;
  if (existing) {
    quote = await prisma.quoteRequest.update({
      where: { sessionId },
      data: {
        answers: mergedAnswers,
        currentStep,
        ...promoted,
      },
    });
  } else {
    quote = await prisma.quoteRequest.create({
      data: {
        sessionId,
        answers: mergedAnswers,
        currentStep,
        ...promoted,
      },
    });
    await prisma.quoteStatusEvent.create({
      data: { quoteId: quote.id, toStatus: "BROUILLON" },
    });
  }

  return NextResponse.json({ ok: true, currentStep: quote.currentStep });
}
