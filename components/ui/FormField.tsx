import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

export const FormField = ({
  label,
  htmlFor,
  error,
  className,
  children,
}: FormFieldProps) => (
  <div className={cn("flex flex-col gap-2", className)}>
    <label htmlFor={htmlFor} className="text-label-caps text-on-surface">
      {label}
    </label>
    {children}
    {error ? (
      <p role="alert" className="text-error text-sm">
        {error}
      </p>
    ) : null}
  </div>
);
