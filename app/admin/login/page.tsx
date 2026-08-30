import type { Metadata } from "next";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Connexion admin",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return (
    <main className="dark bg-deep-black px-margin-mobile relative flex min-h-screen items-center justify-center">
      <div className="ambient-mesh" aria-hidden="true" />
      <div className="w-full max-w-md">
        <div className="mb-stack-lg text-center">
          <h1 className="text-display text-primary mb-2">Spartiat-AI</h1>
          <p className="text-body-lg text-on-surface-variant">Terminal Admin</p>
        </div>

        <div className="glass-card rounded-xl p-8 md:p-10">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <div className="mt-stack-lg text-on-surface-variant flex items-center justify-center gap-2 opacity-70">
          <ShieldCheck className="text-primary h-4 w-4" aria-hidden="true" />
          <span className="text-label-caps">Environnement sécurisé</span>
        </div>
      </div>
    </main>
  );
}
