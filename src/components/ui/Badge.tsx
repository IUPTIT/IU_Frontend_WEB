import type { ReactNode } from "react";

/** Soft tonal chips — work in light + dark (opacity on hue, not *-100). */
export type BadgeTone = "accent" | "success" | "warning" | "danger" | "info" | "violet" | "muted";

export const badgeToneClass: Record<BadgeTone, string> = {
  accent: "bg-accent/15 text-accent",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  danger: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  info: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  muted: "bg-foreground/10 text-muted",
};

type Props = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

function Badge({ tone = "accent", children, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeToneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
