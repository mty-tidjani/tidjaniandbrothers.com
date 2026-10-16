import type { Prisma, SmsCreditTxnType } from "@prisma/client";

type Tx = Prisma.TransactionClient;

/**
 * Applies a credit change and writes the matching ledger row. Must run inside
 * a transaction. Negative changes are conditional updates, so two concurrent
 * sends can never take the balance below zero.
 *
 * Returns the new balance, or null when a debit was refused (not enough
 * credit, or `onlyIfActive` and the account isn't ACTIVE any more).
 */
export async function applyCreditChange(
  tx: Tx,
  change: {
    accountId: string;
    credits: number;
    type: SmsCreditTxnType;
    amountFcfa?: number;
    packageId?: string;
    messageId?: string;
    note?: string;
    actorId?: string;
    onlyIfActive?: boolean;
  },
): Promise<number | null> {
  const { count } = await tx.smsAccount.updateMany({
    where: {
      id: change.accountId,
      ...(change.credits < 0
        ? { creditBalance: { gte: -change.credits } }
        : {}),
      ...(change.onlyIfActive ? { status: "ACTIVE" as const } : {}),
    },
    data: { creditBalance: { increment: change.credits } },
  });
  if (count === 0) return null;

  // The UPDATE above holds the row lock until commit, so this read sees our
  // own write and nobody else's.
  const { creditBalance } = await tx.smsAccount.findUniqueOrThrow({
    where: { id: change.accountId },
    select: { creditBalance: true },
  });

  await tx.smsCreditTransaction.create({
    data: {
      accountId: change.accountId,
      type: change.type,
      credits: change.credits,
      balanceAfter: creditBalance,
      amountFcfa: change.amountFcfa,
      packageId: change.packageId,
      messageId: change.messageId,
      note: change.note,
      actorId: change.actorId,
    },
  });

  return creditBalance;
}
