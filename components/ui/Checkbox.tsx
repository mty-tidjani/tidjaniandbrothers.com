import { cn } from "@/lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
};

export const Checkbox = ({
  label,
  description,
  className,
  id,
  ...props
}: CheckboxProps) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "border-glass-stroke bg-surface-container/50 hover:bg-surface-variant/20 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        className="accent-primary-container mt-1 h-[1.15em] w-[1.15em] shrink-0"
        {...props}
      />
      <span>
        <span className="text-on-surface block font-bold">{label}</span>
        {description ? (
          <span className="text-on-surface-variant block text-sm">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
};
