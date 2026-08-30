import { cn } from "@/lib/utils";

const fieldStyles =
  "w-full rounded-lg border border-glass-stroke bg-surface-container px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 transition-colors focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container";

export const Input = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(fieldStyles, className)} {...props} />
);

export const Textarea = ({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(fieldStyles, "resize-none", className)} {...props} />
);

export const fieldInputStyles = fieldStyles;
