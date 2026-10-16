import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, Globe2, Package, Calculator } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { ActionForm } from "@/components/admin/sms/ActionForm";
import { SmsSubNav } from "@/components/admin/sms/SmsSubNav";
import {
  smsPrimaryButton,
  smsSecondaryButton,
} from "@/components/admin/sms/buttons";
import { auth } from "@/lib/auth";
import { formatFcfa } from "@/lib/format";
import { getSmsPackages, getSmsRateCards } from "@/lib/data/sms";
import { saveRateCard, saveSmsPackage } from "@/lib/actions/sms-pricing";
import { packageMargin, priceForMarkup } from "@/lib/sms/pricing";

export const metadata: Metadata = {
  title: "SMS — Tarifs & marges",
  robots: { index: false },
};

const TARGET_MARKUPS = [30, 50, 70, 100];
const sectionTitle =
  "text-headline-sm text-on-surface mb-2 flex items-center gap-2";
const fieldLabel = "text-label-caps text-on-surface-variant text-xs uppercase";

function pct(value: number) {
  return Number.isFinite(value) ? `${value.toFixed(0)}%` : "—";
}

export default async function AdminSmsPricingPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const [rates, packages] = await Promise.all([
    getSmsRateCards(),
    getSmsPackages(),
  ]);
  const activeRates = rates.filter((r) => r.active);
  const activePackages = packages.filter((p) => p.active);

  // Margins are computed against the worst case on both sides: the most
  // expensive credit we buy, sold at the cheapest price we offer.
  const worstCostPerCredit = activeRates.length
    ? Math.max(...activeRates.map((r) => r.upstreamCostFcfa / r.creditsPerPart))
    : 0;
  const cheapestPricePerCredit = activePackages.length
    ? Math.min(...activePackages.map((p) => p.priceFcfa / p.credits))
    : 0;

  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">SMS API</h1>
        <p className="text-on-surface-variant mt-1">
          Coûts 1s2u par destination et forfaits vendus. 1 crédit = 1 partie de
          SMS vers le Cameroun.
        </p>
      </header>

      <SmsSubNav active="/admin/sms/pricing" />

      <GlassCard hover={false} className="p-6">
        <h2 className={sectionTitle}>
          <Package className="text-primary h-5 w-5" aria-hidden="true" />
          Forfaits de crédits (prix public)
        </h2>
        <p className="text-on-surface-variant mb-4 text-sm">
          Marge calculée sur le coût le plus élevé par crédit :{" "}
          <strong className="text-on-surface">
            {worstCostPerCredit.toFixed(1)} FCFA
          </strong>
          .
        </p>
        <div className="flex flex-col gap-3">
          {packages.map((pkg) => {
            const margin = packageMargin(
              pkg.priceFcfa,
              pkg.credits,
              worstCostPerCredit,
            );
            return (
              <ActionForm
                key={pkg.id}
                action={saveSmsPackage}
                className="border-glass-stroke/50 grid grid-cols-2 items-end gap-3 rounded-lg border p-3 md:grid-cols-[2fr_1fr_1fr_80px_auto_2fr_auto]"
              >
                <input type="hidden" name="id" value={pkg.id} />
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Nom</span>
                  <Input name="name" defaultValue={pkg.name} className="py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Crédits</span>
                  <Input
                    name="credits"
                    type="number"
                    min={1}
                    defaultValue={pkg.credits}
                    className="py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Prix (FCFA)</span>
                  <Input
                    name="priceFcfa"
                    type="number"
                    min={1}
                    defaultValue={pkg.priceFcfa}
                    className="py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Ordre</span>
                  <Input
                    name="sortOrder"
                    type="number"
                    defaultValue={pkg.sortOrder}
                    className="py-2"
                  />
                </label>
                <label className="text-on-surface flex items-center gap-2 pb-3 text-sm">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={pkg.active}
                  />
                  Actif
                </label>
                <div className="pb-2 text-sm">
                  <p className="text-on-surface">
                    {margin.pricePerCredit.toFixed(1)} FCFA / crédit
                  </p>
                  <p
                    className={
                      margin.profitable ? "text-green-400" : "text-error"
                    }
                  >
                    {margin.profitable ? null : (
                      <AlertTriangle
                        className="mr-1 inline h-4 w-4"
                        aria-hidden="true"
                      />
                    )}
                    Marge {pct(margin.grossMarginPct)} · markup{" "}
                    {pct(margin.markupPct)}
                  </p>
                </div>
                <button type="submit" className={smsSecondaryButton}>
                  Enregistrer
                </button>
              </ActionForm>
            );
          })}

          <ActionForm
            action={saveSmsPackage}
            className="border-glass-stroke grid grid-cols-2 items-end gap-3 rounded-lg border border-dashed p-3 md:grid-cols-[2fr_1fr_1fr_80px_auto_auto]"
          >
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Nouveau forfait</span>
              <Input name="name" placeholder="Nom" required className="py-2" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Crédits</span>
              <Input
                name="credits"
                type="number"
                min={1}
                required
                className="py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Prix (FCFA)</span>
              <Input
                name="priceFcfa"
                type="number"
                min={1}
                required
                className="py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Ordre</span>
              <Input
                name="sortOrder"
                type="number"
                defaultValue={packages.length + 1}
                className="py-2"
              />
            </label>
            <label className="text-on-surface flex items-center gap-2 pb-3 text-sm">
              <input type="checkbox" name="active" defaultChecked />
              Actif
            </label>
            <button type="submit" className={smsPrimaryButton}>
              Ajouter
            </button>
          </ActionForm>
        </div>
      </GlassCard>

      <GlassCard hover={false} className="p-6">
        <h2 className={sectionTitle}>
          <Calculator className="text-primary h-5 w-5" aria-hidden="true" />
          Prix plancher par crédit
        </h2>
        <p className="text-on-surface-variant mb-4 text-sm">
          Prix minimum à facturer par crédit pour atteindre un markup donné sur
          le coût le plus élevé ({worstCostPerCredit.toFixed(1)} FCFA).
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {TARGET_MARKUPS.map((markup) => (
            <div
              key={markup}
              className="border-glass-stroke/50 bg-surface-container/50 rounded-lg border p-4"
            >
              <p className={fieldLabel}>Markup {markup}%</p>
              <p className="text-headline-sm text-on-surface">
                {formatFcfa(priceForMarkup(worstCostPerCredit, markup))}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard hover={false} className="p-6">
        <h2 className={sectionTitle}>
          <Globe2 className="text-primary h-5 w-5" aria-hidden="true" />
          Coûts 1s2u par destination
        </h2>
        <p className="text-on-surface-variant mb-4 text-sm">
          Coût d&rsquo;une partie de SMS chez 1s2u, converti en FCFA. Le préfixe
          le plus long l&rsquo;emporte ; une destination sans tarif actif est
          refusée. La marge « pire cas » utilise le forfait le moins cher (
          {cheapestPricePerCredit.toFixed(1)} FCFA / crédit).
        </p>
        <div className="flex flex-col gap-3">
          {rates.map((rate) => {
            const revenue = rate.creditsPerPart * cheapestPricePerCredit;
            const profitable = revenue > rate.upstreamCostFcfa;
            return (
              <ActionForm
                key={rate.id}
                action={saveRateCard}
                className="border-glass-stroke/50 grid grid-cols-2 items-end gap-3 rounded-lg border p-3 md:grid-cols-[100px_2fr_1fr_1fr_auto_2fr_auto]"
              >
                <input type="hidden" name="id" value={rate.id} />
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Préfixe</span>
                  <Input
                    name="prefix"
                    defaultValue={rate.prefix}
                    className="py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Destination</span>
                  <Input
                    name="label"
                    defaultValue={rate.label}
                    className="py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Coût (FCFA)</span>
                  <Input
                    name="upstreamCostFcfa"
                    type="number"
                    min={1}
                    defaultValue={rate.upstreamCostFcfa}
                    className="py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Crédits / partie</span>
                  <Input
                    name="creditsPerPart"
                    type="number"
                    min={1}
                    defaultValue={rate.creditsPerPart}
                    className="py-2"
                  />
                </label>
                <label className="text-on-surface flex items-center gap-2 pb-3 text-sm">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={rate.active}
                  />
                  Actif
                </label>
                <p
                  className={`pb-3 text-sm ${
                    profitable ? "text-green-400" : "text-error"
                  }`}
                >
                  {activePackages.length === 0
                    ? "—"
                    : `${profitable ? "+" : ""}${(revenue - rate.upstreamCostFcfa).toFixed(1)} FCFA / partie`}
                </p>
                <button type="submit" className={smsSecondaryButton}>
                  Enregistrer
                </button>
              </ActionForm>
            );
          })}

          <ActionForm
            action={saveRateCard}
            className="border-glass-stroke grid grid-cols-2 items-end gap-3 rounded-lg border border-dashed p-3 md:grid-cols-[100px_2fr_1fr_1fr_auto_auto]"
          >
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Préfixe</span>
              <Input
                name="prefix"
                placeholder="241"
                required
                className="py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Destination</span>
              <Input
                name="label"
                placeholder="Gabon"
                required
                className="py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Coût (FCFA)</span>
              <Input
                name="upstreamCostFcfa"
                type="number"
                min={1}
                required
                className="py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Crédits / partie</span>
              <Input
                name="creditsPerPart"
                type="number"
                min={1}
                defaultValue={1}
                className="py-2"
              />
            </label>
            <label className="text-on-surface flex items-center gap-2 pb-3 text-sm">
              <input type="checkbox" name="active" defaultChecked />
              Actif
            </label>
            <button type="submit" className={smsPrimaryButton}>
              Ajouter
            </button>
          </ActionForm>
        </div>
      </GlassCard>
    </div>
  );
}
