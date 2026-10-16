// In-process login throttle (single PM2 instance — see SMS.md §9). Counts
// failed attempts per email so a password can't be brute-forced.
const MAX_FAILURES = 8;
const WINDOW_MS = 15 * 60 * 1000;

const failures = new Map<string, { count: number; firstAt: number }>();

export function isLoginLocked(email: string): boolean {
  const entry = failures.get(email);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    failures.delete(email);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordLoginFailure(email: string) {
  const entry = failures.get(email);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    failures.set(email, { count: 1, firstAt: Date.now() });
  } else {
    entry.count += 1;
  }
}

export function clearLoginFailures(email: string) {
  failures.delete(email);
}
