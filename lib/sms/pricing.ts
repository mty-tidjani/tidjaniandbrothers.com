import type { SmsRateCard } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Rate = Pick<
  SmsRateCard,
  "prefix" | "label" | "upstreamCostFcfa" | "creditsPerPart"
>;

export async function getActiveRates(): Promise<Rate[]> {
  const rates = await prisma.smsRateCard.findMany({
    where: { active: true },
    select: {
      prefix: true,
      label: true,
      upstreamCostFcfa: true,
      creditsPerPart: true,
    },
  });
  // Longest prefix first, so a network-level row ("23767") beats the
  // country row ("237").
  return rates.sort((a, b) => b.prefix.length - a.prefix.length);
}

export function matchRate(number: string, rates: Rate[]): Rate | null {
  return rates.find((rate) => number.startsWith(rate.prefix)) ?? null;
}

export type Quote = {
  perRecipient: Map<string, { credits: number; costFcfa: number }>;
  credits: number;
  upstreamCostFcfa: number;
  unsupported: string[];
};

export function quote(recipients: string[], parts: number, rates: Rate[]) {
  const result: Quote = {
    perRecipient: new Map(),
    credits: 0,
    upstreamCostFcfa: 0,
    unsupported: [],
  };
  for (const number of recipients) {
    const rate = matchRate(number, rates);
    if (!rate) {
      result.unsupported.push(number);
      continue;
    }
    const credits = rate.creditsPerPart * parts;
    const costFcfa = rate.upstreamCostFcfa * parts;
    result.perRecipient.set(number, { credits, costFcfa });
    result.credits += credits;
    result.upstreamCostFcfa += costFcfa;
  }
  return result;
}

export type Margin = {
  pricePerCredit: number;
  /** Profit as a share of the selling price. */
  grossMarginPct: number;
  /** Profit as a share of our cost. */
  markupPct: number;
  profitable: boolean;
};

/**
 * Margin of selling `credits` for `priceFcfa`, when each credit costs us
 * `costPerCreditFcfa` at 1s2u (the reference-corridor rate).
 */
export function packageMargin(
  priceFcfa: number,
  credits: number,
  costPerCreditFcfa: number,
): Margin {
  const pricePerCredit = priceFcfa / credits;
  const profit = pricePerCredit - costPerCreditFcfa;
  return {
    pricePerCredit,
    grossMarginPct: pricePerCredit > 0 ? (profit / pricePerCredit) * 100 : 0,
    markupPct:
      costPerCreditFcfa > 0 ? (profit / costPerCreditFcfa) * 100 : Infinity,
    profitable: profit > 0,
  };
}

/** Smallest price per credit we'd sell at for a target markup. */
export function priceForMarkup(costFcfa: number, markupPct: number): number {
  return Math.ceil(costFcfa * (1 + markupPct / 100));
}
