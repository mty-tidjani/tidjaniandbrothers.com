import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auditBookingSchema, contactFormSchema } from "@/lib/validation/lead";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("source" in body) ||
    (body.source !== "audit" && body.source !== "contact")
  ) {
    return NextResponse.json(
      { error: "Champ 'source' manquant ou invalide" },
      { status: 400 },
    );
  }

  if (body.source === "audit") {
    const parsed = auditBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Formulaire invalide", issues: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const data = parsed.data;
    const lead = await prisma.lead.create({
      data: {
        fullName: data.fullName,
        company: data.company,
        phone: data.phone,
        email: data.email,
        sector: data.sector,
        servicesWanted: data.servicesWanted,
        preferredSlot: data.preferredSlot,
        message: data.message || null,
        source: "AUDIT",
      },
    });
    await prisma.leadStatusEvent.create({
      data: { leadId: lead.id, toStatus: "NOUVEAU" },
    });
    return NextResponse.json(
      { id: lead.id, phone: lead.phone },
      { status: 201 },
    );
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Formulaire invalide", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const data = parsed.data;
  const lead = await prisma.lead.create({
    data: {
      fullName: data.fullName,
      company: data.company,
      phone: data.phone,
      email: data.email,
      sector: "non_precise",
      servicesWanted: [data.service],
      message: data.message,
      source: "CONTACT",
    },
  });
  await prisma.leadStatusEvent.create({
    data: { leadId: lead.id, toStatus: "NOUVEAU" },
  });
  return NextResponse.json({ id: lead.id, phone: lead.phone }, { status: 201 });
}
