import { cn } from "@/lib/utils";

export function AuthCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full max-w-md", className)}>
      <div className="glass-card rounded-xl p-6 md:p-8">
        <h1 className="text-headline-md text-on-surface">{title}</h1>
        {subtitle ? (
          <p className="text-on-surface-variant mt-1 mb-6">{subtitle}</p>
        ) : (
          <div className="mb-6" />
        )}
        {children}
      </div>
    </div>
  );
}
