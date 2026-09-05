export type CookieCategory = "necessary" | "analytics" | "marketing";
type OptionalCategory = Exclude<CookieCategory, "necessary">;

export type CookiePreferences = Record<OptionalCategory, boolean>;

type StoredConsent = CookiePreferences & {
  version: number;
  decidedAt: string;
};

export const COOKIE_CATEGORIES: {
  id: OptionalCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "analytics",
    label: "Mesure d'audience",
    description:
      "Statistiques de visite anonymisées, utilisées pour comprendre l'usage du site et l'améliorer.",
  },
  {
    id: "marketing",
    label: "Marketing",
    description:
      "Personnalisation publicitaire et mesure de l'efficacité de nos campagnes.",
  },
];

export const DEFAULT_CONSENT: CookiePreferences = {
  analytics: false,
  marketing: false,
};

export const FULL_CONSENT: CookiePreferences = {
  analytics: true,
  marketing: true,
};

const STORAGE_KEY = "tab_cookie_consent";
const COOKIE_NAME = "tab_cookie_consent";
// CNIL guidance caps consent validity at 13 months; 6 months keeps re-prompting
// closer to how often the site's actual cookie usage is likely to change.
const CONSENT_MAX_AGE_DAYS = 180;
const CONSENT_VERSION = 1;

export const CONSENT_EVENT = "tab:cookie-consent-changed";
export const OPEN_PREFERENCES_EVENT = "tab:open-cookie-preferences";

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) return null;

    const ageMs = Date.now() - new Date(parsed.decidedAt).getTime();
    if (ageMs > CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(preferences: CookiePreferences): void {
  if (typeof window === "undefined") return;

  const stored: StoredConsent = {
    ...preferences,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // localStorage unavailable (private browsing, storage disabled) — the
    // cookie below still records the choice for this session.
  }

  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(stored))}; path=/; max-age=${maxAge}; SameSite=Lax`;

  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: stored }));
}

export function hasConsent(category: CookieCategory): boolean {
  if (category === "necessary") return true;
  return readStoredConsent()?.[category] ?? false;
}
