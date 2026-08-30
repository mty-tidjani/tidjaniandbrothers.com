import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldInputStyles } from "@/components/ui/Input";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

export const Select = ({ className, children, ...props }: SelectProps) => (
  <div className="relative">
    <select
      className={cn(
        fieldInputStyles,
        "cursor-pointer appearance-none pr-10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="text-on-surface-variant pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2"
      aria-hidden="true"
    />
  </div>
);
