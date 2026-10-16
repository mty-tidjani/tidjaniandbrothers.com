import type { SmsApiError, SmsApiErrorCode } from "@/lib/sms/errors";

// French wording for the customer portal. The public API keeps English
// messages; these are for people, not integrations.
export const PORTAL_ERROR_LABELS: Record<SmsApiErrorCode, string> = {
  UNAUTHORIZED: "Session expirée, reconnectez-vous.",
  ACCOUNT_INACTIVE: "Votre compte n'est pas actif : contactez-nous.",
  SENDER_ID_BLOCKED: "Ce nom d'expéditeur a été bloqué.",
  SENDER_ID_NOT_APPROVED: "Ce nom d'expéditeur n'est pas encore approuvé.",
  BAD_REQUEST: "Requête invalide.",
  INVALID_RECIPIENT: "Numéro invalide.",
  UNSUPPORTED_DESTINATION: "Destination non desservie pour le moment.",
  MESSAGE_TOO_LONG: "Message trop long (5 SMS maximum).",
  INSUFFICIENT_CREDIT: "Crédit insuffisant.",
  RATE_LIMITED: "Trop d'envois rapprochés, réessayez dans un instant.",
  NOT_FOUND: "Introuvable.",
  SENDER_ID_REJECTED: "Nom d'expéditeur refusé par l'opérateur.",
  NETWORK_NOT_SUPPORTED: "Réseau du destinataire non pris en charge.",
  INVALID_MESSAGE: "Texte du message refusé par l'opérateur.",
  UPSTREAM_UNAVAILABLE:
    "Service momentanément indisponible, réessayez plus tard.",
  INTERNAL_ERROR: "Erreur de notre côté, réessayez plus tard.",
};

export function portalErrorMessage(error: SmsApiError): string {
  const details = error.details as Record<string, unknown> | undefined;
  switch (error.code) {
    case "INVALID_RECIPIENT":
      return `Numéros invalides : ${(details?.invalid as string[]).join(", ")}. Utilisez le format international, ex. 2376XXXXXXXX.`;
    case "UNSUPPORTED_DESTINATION":
      return `Destinations non desservies : ${(details?.numbers as string[]).join(", ")}.`;
    case "INSUFFICIENT_CREDIT":
      return `Crédit insuffisant : cet envoi nécessite ${details?.required} crédits.`;
    case "MESSAGE_TOO_LONG":
      return `Message trop long : ${details?.parts} SMS, le maximum est ${details?.maxParts}.`;
    case "BAD_REQUEST":
      return error.message;
    default:
      return PORTAL_ERROR_LABELS[error.code];
  }
}
