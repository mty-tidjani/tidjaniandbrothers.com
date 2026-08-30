import { cn } from "@/lib/utils";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export const GlassCard = ({
  className,
  hover = true,
  ...props
}: GlassCardProps) => (
  <div
    className={cn("glass-card rounded-xl", hover && "glow-hover", className)}
    {...props}
  />
);
