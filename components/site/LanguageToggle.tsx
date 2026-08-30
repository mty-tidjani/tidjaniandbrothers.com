// English copy hasn't been written yet (see project scope notes), so this
// intentionally isn't a working switch — it signals the roadmap without
// faking a toggle that would silently do nothing when clicked.
export function LanguageToggle() {
  return (
    <div className="text-label-caps flex items-center gap-1">
      <span
        className="border-primary text-primary border-b"
        aria-current="true"
      >
        FR
      </span>
      <span aria-hidden="true" className="text-on-surface-variant/50">
        /
      </span>
      <span
        className="text-on-surface-variant/50 cursor-default"
        title="Version anglaise bientôt disponible"
      >
        EN
      </span>
    </div>
  );
}
