"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  COOKIE_CATEGORIES,
  DEFAULT_CONSENT,
  FULL_CONSENT,
  OPEN_PREFERENCES_EVENT,
  readStoredConsent,
  writeConsent,
  type CookiePreferences,
} from "@/lib/cookie-consent";

// Let the page settle before interrupting the visit with the consent modal.
const INITIAL_DELAY_MS = 1500;

// localStorage isn't available during SSR, so the very first client render
// must match the server (nothing shown) — this distinguishes that first
// client pass from later ones without a setState-in-effect cascade.
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function CookieConsent() {
  const mounted = useMounted();
  const storedConsent = mounted ? readStoredConsent() : null;
  const hasStoredConsent = storedConsent !== null;

  const [open, setOpen] = useState(false);
  const [detailed, setDetailed] = useState(false);
  const [draftPreferences, setDraftPreferences] =
    useState<CookiePreferences | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const preferences =
    draftPreferences ??
    (storedConsent
      ? { analytics: storedConsent.analytics, marketing: storedConsent.marketing }
      : DEFAULT_CONSENT);

  useEffect(() => {
    if (!mounted || hasStoredConsent) return;
    const timer = setTimeout(() => setOpen(true), INITIAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [mounted, hasStoredConsent]);

  useEffect(() => {
    function handleOpenRequest() {
      setDraftPreferences(null);
      setDetailed(true);
      setOpen(true);
    }

    window.addEventListener(OPEN_PREFERENCES_EVENT, handleOpenRequest);
    return () =>
      window.removeEventListener(OPEN_PREFERENCES_EVENT, handleOpenRequest);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("button, input")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  function confirm(next: CookiePreferences) {
    writeConsent(next);
    setDraftPreferences(null);
    setOpen(false);
    setDetailed(false);
  }

  return (
    <>
      {hasStoredConsent ? (
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))
          }
          aria-label="Gérer mes préférences de cookies"
          className="border-glass-stroke bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:border-primary fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-colors"
        >
          <Cookie className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}

      {open ? (
        <div className="bg-deep-black/50 fixed inset-0 z-50 flex items-end justify-center p-4 backdrop-blur-sm sm:items-center">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-consent-title"
            className="glass-card w-full max-w-lg rounded-xl p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2
                id="cookie-consent-title"
                className="text-headline-sm text-on-surface font-bold"
              >
                Gestion des cookies
              </h2>
              {hasStoredConsent ? (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="text-on-surface-variant hover:text-primary shrink-0"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <p className="text-on-surface-variant text-sm">
              Nous utilisons des cookies pour assurer le bon fonctionnement du
              site, mesurer son audience et améliorer votre expérience. Vous
              pouvez tout accepter, tout refuser, ou choisir précisément ce
              que vous autorisez.
            </p>

            {detailed ? (
              <div className="mt-stack-md flex flex-col gap-3">
                <Checkbox
                  label="Cookies nécessaires"
                  description="Indispensables au fonctionnement du site (navigation, sécurité). Toujours actifs."
                  checked
                  disabled
                  readOnly
                />
                {COOKIE_CATEGORIES.map((category) => (
                  <Checkbox
                    key={category.id}
                    label={category.label}
                    description={category.description}
                    checked={preferences[category.id]}
                    onChange={(event) =>
                      setDraftPreferences({
                        ...preferences,
                        [category.id]: event.target.checked,
                      })
                    }
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-stack-lg flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {detailed ? (
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={() => setDetailed(false)}
                >
                  Retour
                </Button>
              ) : (
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={() => setDetailed(true)}
                >
                  Personnaliser
                </Button>
              )}
              {/* Accept/reject carry equal visual weight on purpose — CNIL
                  guidance flags banners that make "accept" more prominent
                  than "reject" as invalid consent. */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => confirm(DEFAULT_CONSENT)}
                >
                  Tout refuser
                </Button>
                {detailed ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => confirm(preferences)}
                  >
                    Enregistrer mes choix
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => confirm(FULL_CONSENT)}
                  >
                    Tout accepter
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
