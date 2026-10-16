import Link from "next/link";
import { Clock, PauseCircle } from "lucide-react";

export function AccountStatusBanner({ status }: { status: string }) {
  if (status === "PENDING") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-700 dark:text-cyan-400">
        <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          Votre compte est en attente d&rsquo;activation. Demandez votre nom
          d&rsquo;expéditeur, puis{" "}
          <Link href="/sms/credits" className="font-bold underline">
            contactez-nous pour recharger
          </Link>{" "}
          : nous activons le compte dès réception du paiement.
        </p>
      </div>
    );
  }
  if (status === "SUSPENDED") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-500">
        <PauseCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          Votre compte est suspendu : les envois sont bloqués. Votre historique
          reste consultable.{" "}
          <Link href="/sms/credits" className="font-bold underline">
            Contactez-nous
          </Link>
          .
        </p>
      </div>
    );
  }
  return null;
}
