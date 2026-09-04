import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  className?: string;
};

// The mark's dark strokes have no built-in contrast guarantee against this
// site's dark theme, so it always sits on a small white badge rather than
// being dropped directly onto whatever surface it's placed on.
export function Logo({ size = 40, className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-white",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/logo.png"
        alt="Tidjani & Brothers"
        width={size}
        height={size}
        className="h-full w-full object-contain"
        priority
      />
    </span>
  );
}
