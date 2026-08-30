import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false },
};

async function action(formData: FormData) {
  "use server";
  await requestPasswordReset(formData);
  redirect("/admin/forgot-password/sent");
}

export default function ForgotPasswordPage() {
  return (
    <main className="dark bg-deep-black px-margin-mobile relative flex min-h-screen items-center justify-center">
      <div className="ambient-mesh" aria-hidden="true" />
      <div className="w-full max-w-md">
        <div className="mb-stack-lg text-center">
          <h1 className="text-display text-primary mb-2">Spartiat-AI</h1>
          <p className="text-body-lg text-on-surface-variant">Terminal Admin</p>
        </div>

        <div className="glass-card rounded-xl p-8 md:p-10">
          <h2 className="text-headline-sm text-on-surface mb-2">
            Mot de passe oublié ?
          </h2>
          <p className="mb-stack-md text-on-surface-variant text-sm">
            Entrez votre email, nous vous enverrons un lien de réinitialisation.
          </p>
          <form action={action} className="gap-stack-md flex flex-col">
            <div className="relative">
              <Mail
                className="text-on-surface-variant pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Adresse email"
                className="pl-10"
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Envoyer le lien de réinitialisation
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
