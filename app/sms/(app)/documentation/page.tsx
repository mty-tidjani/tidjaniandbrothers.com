import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/sms-portal/PageHeader";
import { SITE_URL } from "@/lib/constants";
import { PORTAL_ERROR_LABELS } from "@/lib/sms-portal/messages";
import { SMS_API_ERROR_STATUS, type SmsApiErrorCode } from "@/lib/sms/errors";
import { requirePortalSession } from "@/lib/sms-portal/session";

export const metadata = { title: "Documentation API" };

const BASE_URL = `${SITE_URL}/api/sms/v1`;

const CURL = `curl -X POST ${BASE_URL}/send \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json" \\
  -d '{"to": ["237670000000"], "message": "Votre code est 4821"}'`;

const JS = `const res = await fetch("${BASE_URL}/send", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.SMS_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    to: ["237670000000", "237650000000"],
    message: "Votre commande est prête !",
  }),
});
const data = await res.json();
if (!res.ok) throw new Error(data.error.code);`;

const PHP = `$ch = curl_init("${BASE_URL}/send");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer " . getenv("SMS_API_KEY"),
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS => json_encode([
    "to" => ["237670000000"],
    "message" => "Votre code est 4821",
  ]),
]);
$data = json_decode(curl_exec($ch), true);`;

const RESPONSE = `{
  "id": "cm2abc…",
  "status": "sent",
  "sender": "MONSHOP",
  "encoding": "gsm7",
  "parts": 1,
  "recipients": 1,
  "creditsCharged": 1,
  "creditsRefunded": 0,
  "createdAt": "2026-10-16T12:00:00.000Z",
  "batches": [{ "recipients": ["237670000000"], "status": "submitted" }],
  "balance": 499
}`;

const ERROR = `{
  "error": {
    "code": "INSUFFICIENT_CREDIT",
    "message": "Not enough credit.",
    "details": { "required": 6 }
  }
}`;

// Codes a customer can actually receive, in a sensible reading order.
const CODES: SmsApiErrorCode[] = [
  "UNAUTHORIZED",
  "ACCOUNT_INACTIVE",
  "SENDER_ID_BLOCKED",
  "SENDER_ID_NOT_APPROVED",
  "BAD_REQUEST",
  "INSUFFICIENT_CREDIT",
  "INVALID_RECIPIENT",
  "UNSUPPORTED_DESTINATION",
  "MESSAGE_TOO_LONG",
  "NETWORK_NOT_SUPPORTED",
  "INVALID_MESSAGE",
  "SENDER_ID_REJECTED",
  "NOT_FOUND",
  "RATE_LIMITED",
  "UPSTREAM_UNAVAILABLE",
  "INTERNAL_ERROR",
];

function Code({ children }: { children: string }) {
  return (
    <pre className="border-glass-stroke bg-surface-container-lowest text-on-surface overflow-x-auto rounded-lg border p-4 text-sm leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <p className="mb-3 font-mono text-sm">
      <span className="bg-primary-container/15 text-primary mr-2 rounded px-2 py-1 font-bold">
        {method}
      </span>
      <span className="text-on-surface">{path}</span>
    </p>
  );
}

const h2 = "text-headline-sm text-on-surface mb-3";
const p = "text-on-surface-variant mb-3 text-sm";
const inline = "bg-surface-container rounded px-1.5 py-0.5 font-mono text-xs";

export default async function SmsApiDocsPage() {
  await requirePortalSession();

  return (
    <>
      <PageHeader
        title="Documentation API"
        description="Envoyez des SMS depuis votre application en une requête HTTP."
      />

      <GlassCard hover={false} className="p-6">
        <h2 className={h2}>Authentification</h2>
        <p className={p}>
          Créez une clé dans{" "}
          <Link href="/sms/cles-api" className="text-primary hover:underline">
            Clés API
          </Link>{" "}
          et envoyez-la dans l&rsquo;en-tête{" "}
          <code className={inline}>Authorization: Bearer VOTRE_CLE_API</code>.
          Le nom d&rsquo;expéditeur est celui associé à la clé. Gardez la clé
          côté serveur uniquement.
        </p>
        <p className={p}>
          URL de base : <code className={inline}>{BASE_URL}</code>
        </p>
      </GlassCard>

      <GlassCard hover={false} className="p-6">
        <h2 className={h2}>Envoyer un SMS</h2>
        <Endpoint method="POST" path="/send" />
        <ul className="text-on-surface-variant mb-4 list-disc space-y-1 pl-5 text-sm">
          <li>
            <code className={inline}>to</code> : tableau (ou texte séparé par
            des virgules) de 1 à 300 numéros au format international, ex.{" "}
            <code className={inline}>237670000000</code>. Les préfixes{" "}
            <code className={inline}>+</code> /{" "}
            <code className={inline}>00</code> et les espaces sont acceptés.
          </li>
          <li>
            <code className={inline}>message</code> : le texte, 5 SMS maximum
            (765 caractères standard, ou 335 avec accents comme ê, ç ou emojis).
          </li>
          <li>
            <code className={inline}>encoding</code> (facultatif) :{" "}
            <code className={inline}>auto</code> (défaut),{" "}
            <code className={inline}>gsm7</code> ou{" "}
            <code className={inline}>unicode</code>.
          </li>
        </ul>
        <div className="space-y-4">
          <div>
            <p className="text-on-surface mb-2 text-sm font-bold">curl</p>
            <Code>{CURL}</Code>
          </div>
          <div>
            <p className="text-on-surface mb-2 text-sm font-bold">
              JavaScript (Node.js)
            </p>
            <Code>{JS}</Code>
          </div>
          <div>
            <p className="text-on-surface mb-2 text-sm font-bold">PHP</p>
            <Code>{PHP}</Code>
          </div>
          <div>
            <p className="text-on-surface mb-2 text-sm font-bold">
              Réponse <span className="font-normal">(201)</span>
            </p>
            <Code>{RESPONSE}</Code>
          </div>
        </div>
        <p className={`${p} mt-4`}>
          <code className={inline}>status</code> vaut{" "}
          <code className={inline}>sent</code>, ou{" "}
          <code className={inline}>partial</code> si une partie des
          destinataires a échoué : ces crédits sont remboursés et le lot
          concerné porte un <code className={inline}>error</code>. «{" "}
          <code className={inline}>submitted</code> » signifie accepté par
          l&rsquo;opérateur.
        </p>
      </GlassCard>

      <GlassCard hover={false} className="p-6">
        <h2 className={h2}>Consulter le solde</h2>
        <Endpoint method="GET" path="/balance" />
        <Code>{`{ "credits": 499, "accountStatus": "active", "sender": { "value": "MONSHOP", "status": "approved" } }`}</Code>
      </GlassCard>

      <GlassCard hover={false} className="p-6">
        <h2 className={h2}>Consulter un envoi</h2>
        <Endpoint method="GET" path="/messages/{id}" />
        <p className={p}>
          Renvoie le même format que l&rsquo;envoi, sans{" "}
          <code className={inline}>balance</code>.
        </p>
      </GlassCard>

      <GlassCard hover={false} className="p-6">
        <h2 className={h2}>Erreurs</h2>
        <Code>{ERROR}</Code>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-glass-stroke/50 text-label-caps text-on-surface-variant border-b uppercase">
                <th className="px-3 py-2">HTTP</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Signification</th>
              </tr>
            </thead>
            <tbody>
              {CODES.map((code) => (
                <tr
                  key={code}
                  className="border-glass-stroke/30 border-b last:border-0"
                >
                  <td className="text-on-surface-variant px-3 py-2 tabular-nums">
                    {SMS_API_ERROR_STATUS[code]}
                  </td>
                  <td className="text-on-surface px-3 py-2 font-mono text-xs">
                    {code}
                  </td>
                  <td className="text-on-surface-variant px-3 py-2">
                    {PORTAL_ERROR_LABELS[code]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={`${p} mt-4`}>
          Limite : 5 requêtes par seconde et par clé. En cas de{" "}
          <code className={inline}>429</code> ou{" "}
          <code className={inline}>503</code>, réessayez après quelques
          secondes.
        </p>
      </GlassCard>
    </>
  );
}
