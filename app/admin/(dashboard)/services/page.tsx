import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Save } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { auth } from "@/lib/auth";
import { getServiceTiers, getMaintenancePlan } from "@/lib/data/services";
import { saveServiceTiers } from "@/lib/actions/services";

export const metadata: Metadata = {
  title: "Services & Tarifs",
  robots: { index: false },
};

export default async function AdminServicesPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const [tiers, maintenance] = await Promise.all([
    getServiceTiers(),
    getMaintenancePlan(),
  ]);
  const allTiers = maintenance ? [...tiers, maintenance] : tiers;

  return (
    <form action={saveServiceTiers} className="gap-stack-md flex flex-col">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">
            Services &amp; Tarifs
          </h1>
          <p className="text-on-surface-variant mt-1">
            Modifiez les formules Odoo sans toucher au code.
          </p>
        </div>
        <button
          type="submit"
          className="bg-primary text-on-accent flex items-center gap-2 rounded-lg px-6 py-3 font-bold transition-shadow hover:shadow-[0_0_15px_var(--color-glow)]"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Enregistrer les modifications
        </button>
      </header>

      <div className="gap-gutter grid grid-cols-1 lg:grid-cols-3">
        {allTiers.map((tier) => (
          <GlassCard
            key={tier.id}
            hover={false}
            className="gap-stack-md flex flex-col p-6"
          >
            <input type="hidden" name="id" value={tier.id} />
            <h3 className="border-glass-stroke text-label-caps text-on-surface border-b pb-3 tracking-widest uppercase">
              {tier.isMaintenance ? "Maintenance" : tier.name}
            </h3>
            <FormField label="Nom de la formule" htmlFor={`name-${tier.id}`}>
              <Input
                id={`name-${tier.id}`}
                name={`name-${tier.id}`}
                defaultValue={tier.name}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Prix min (FCFA)"
                htmlFor={`priceMin-${tier.id}`}
              >
                <Input
                  id={`priceMin-${tier.id}`}
                  name={`priceMin-${tier.id}`}
                  type="number"
                  defaultValue={tier.priceMin}
                />
              </FormField>
              <FormField
                label="Prix max (FCFA)"
                htmlFor={`priceMax-${tier.id}`}
              >
                <Input
                  id={`priceMax-${tier.id}`}
                  name={`priceMax-${tier.id}`}
                  type="number"
                  defaultValue={tier.priceMax ?? ""}
                  placeholder="Vide = sur devis"
                />
              </FormField>
            </div>
            <FormField label="Utilisateurs" htmlFor={`maxUsers-${tier.id}`}>
              <Input
                id={`maxUsers-${tier.id}`}
                name={`maxUsers-${tier.id}`}
                defaultValue={tier.maxUsers ?? ""}
              />
            </FormField>
            <FormField
              label="Fonctionnalités incluses (une par ligne)"
              htmlFor={`features-${tier.id}`}
              className="flex-1"
            >
              <Textarea
                id={`features-${tier.id}`}
                name={`features-${tier.id}`}
                defaultValue={tier.features.join("\n")}
                rows={5}
              />
            </FormField>
          </GlassCard>
        ))}
      </div>
    </form>
  );
}
