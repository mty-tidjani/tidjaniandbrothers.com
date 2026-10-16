export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-headline-md text-on-surface">{title}</h1>
        {description ? (
          <p className="text-on-surface-variant mt-1">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-3">{actions}</div> : null}
    </header>
  );
}
