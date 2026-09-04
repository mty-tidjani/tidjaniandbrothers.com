// STUB — no email provider wired up yet.
// TODO: replace with a real transactional email call (Resend/SendGrid) once
// an account/API key is provisioned — notify the internal sales inbox and
// optionally send a confirmation to quote.contactEmail.
export async function notifyDevisSubmitted(quote: {
  id: string;
  companyName: string | null;
  contactEmail: string | null;
}): Promise<void> {
  console.log(
    `[devis] Nouvelle demande de devis soumise: ${quote.id} — ${
      quote.companyName ?? "Entreprise non renseignée"
    }`,
  );
}
