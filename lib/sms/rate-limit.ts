// In-process limiters. Correct only while the app runs as a single process
// (process.json: instances 1, fork mode). Moving to several instances needs a
// shared store (Redis/Postgres) instead — see SMS.md §8.

// 1s2u allows 30 req/s for the whole account, shared by every one of our
// customers. Stay under it to leave headroom for retries.
const UPSTREAM_RATE_PER_SECOND = 25;

// Per API key, so one customer can't eat the whole upstream budget.
export const KEY_REQUESTS_PER_SECOND = 5;

let upstreamTokens = UPSTREAM_RATE_PER_SECOND;
let upstreamRefilledAt = Date.now();

function refillUpstream() {
  const now = Date.now();
  const elapsed = (now - upstreamRefilledAt) / 1000;
  upstreamTokens = Math.min(
    UPSTREAM_RATE_PER_SECOND,
    upstreamTokens + elapsed * UPSTREAM_RATE_PER_SECOND,
  );
  upstreamRefilledAt = now;
}

/** Resolves once we're allowed to make one more call to 1s2u. */
export async function acquireUpstreamSlot(): Promise<void> {
  for (;;) {
    refillUpstream();
    if (upstreamTokens >= 1) {
      upstreamTokens -= 1;
      return;
    }
    const waitMs = Math.ceil(
      ((1 - upstreamTokens) / UPSTREAM_RATE_PER_SECOND) * 1000,
    );
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

const keyWindows = new Map<string, { windowStart: number; count: number }>();
let lastPrune = Date.now();

/** Fixed one-second window per key. Returns false when over the limit. */
export function allowKeyRequest(keyId: string): boolean {
  const now = Date.now();
  if (now - lastPrune > 60_000) {
    for (const [id, entry] of keyWindows) {
      if (now - entry.windowStart > 1000) keyWindows.delete(id);
    }
    lastPrune = now;
  }

  const entry = keyWindows.get(keyId);
  if (!entry || now - entry.windowStart >= 1000) {
    keyWindows.set(keyId, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= KEY_REQUESTS_PER_SECOND) return false;
  entry.count += 1;
  return true;
}
