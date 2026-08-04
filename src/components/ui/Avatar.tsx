import { initials } from "../../utils/initials";

type Size = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<Size, string> = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-24 w-24 text-2xl",
};

type Props = {
  name: string;
  src?: string | null;
  size?: Size;
  className?: string;
};

/**
 * Soft UI avatar — image or initials. Sizes stay square (no stretch).
 */
function Avatar({ name, src, size = "md", className = "" }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/15 font-bold text-accent ${sizeClass[size]} ${className}`}
      aria-hidden={!src}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export default Avatar;
