import type { LucideIcon, LucideProps } from "lucide-react";

type Props = LucideProps & {
  icon: LucideIcon;
  /** Default 20 — keep icon optical size consistent across Soft UI. */
  size?: number;
};

/**
 * Lucide wrapper — stroke weight + size defaults for Soft UI.
 */
function Icon({ icon: Lucide, size = 20, strokeWidth = 1.75, className = "", "aria-hidden": ariaHidden = true, ...rest }: Props) {
  return (
    <Lucide
      size={size}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`}
      aria-hidden={ariaHidden}
      {...rest}
    />
  );
}

export default Icon;
