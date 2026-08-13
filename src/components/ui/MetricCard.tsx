import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Icon from "./Icon";

export type MetricTone = "accent" | "emerald" | "sky" | "violet" | "amber" | "rose" | "slate";

const toneClass: Record<MetricTone, { icon: string; value: string; tick: string }> = {
  accent: {
    icon: "bg-accent/12 text-accent",
    value: "text-accent",
    tick: "bg-accent",
  },
  emerald: {
    icon: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    value: "text-emerald-600 dark:text-emerald-300",
    tick: "bg-emerald-500",
  },
  sky: {
    icon: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
    value: "text-sky-600 dark:text-sky-300",
    tick: "bg-sky-500",
  },
  violet: {
    icon: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
    value: "text-violet-600 dark:text-violet-300",
    tick: "bg-violet-500",
  },
  amber: {
    icon: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
    value: "text-amber-600 dark:text-amber-300",
    tick: "bg-amber-500",
  },
  rose: {
    icon: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
    value: "text-rose-600 dark:text-rose-300",
    tick: "bg-rose-500",
  },
  slate: {
    icon: "bg-foreground/[0.06] text-muted",
    value: "text-foreground",
    tick: "bg-muted/50",
  },
};

type Props = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: MetricTone;
  icon?: LucideIcon;
  className?: string;
};

/**
 * KPI / summary card — flat surface (ui-card), tonal icon chip, tonal value.
 */
function MetricCard({ label, value, hint, tone = "accent", icon, className = "" }: Props) {
  const t = toneClass[tone];
  return (
    <article className={`ui-card ui-card-hover !p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="eyebrow truncate">{label}</p>
          <p className={`stat-num text-3xl ${t.value}`}>{value}</p>
          <span className={`block h-0.5 w-8 rounded-full ${t.tick}`} aria-hidden />
          {hint && <p className="pt-0.5 text-xs text-muted">{hint}</p>}
        </div>
        {icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.icon}`}>
            <Icon icon={icon} size={20} />
          </span>
        )}
      </div>
    </article>
  );
}

export default MetricCard;
