import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Icon from "./Icon";

export type MetricTone = "accent" | "emerald" | "sky" | "violet" | "amber" | "rose" | "slate";

const toneClass: Record<MetricTone, { card: string; icon: string; value: string }> = {
  accent: {
    card: "bg-gradient-to-br from-accent/18 via-background to-background ring-1 ring-accent/25",
    icon: "bg-accent/20 text-accent",
    value: "text-accent",
  },
  emerald: {
    card: "bg-gradient-to-br from-emerald-500/18 via-background to-background ring-1 ring-emerald-500/25",
    icon: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
    value: "text-emerald-700 dark:text-emerald-300",
  },
  sky: {
    card: "bg-gradient-to-br from-sky-500/18 via-background to-background ring-1 ring-sky-500/25",
    icon: "bg-sky-500/20 text-sky-600 dark:text-sky-300",
    value: "text-sky-700 dark:text-sky-300",
  },
  violet: {
    card: "bg-gradient-to-br from-violet-500/18 via-background to-background ring-1 ring-violet-500/25",
    icon: "bg-violet-500/20 text-violet-600 dark:text-violet-300",
    value: "text-violet-700 dark:text-violet-300",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-500/18 via-background to-background ring-1 ring-amber-500/25",
    icon: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
    value: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    card: "bg-gradient-to-br from-rose-500/18 via-background to-background ring-1 ring-rose-500/25",
    icon: "bg-rose-500/20 text-rose-600 dark:text-rose-300",
    value: "text-rose-600 dark:text-rose-300",
  },
  slate: {
    card: "bg-gradient-to-br from-foreground/[0.06] via-background to-background ring-1 ring-black/5",
    icon: "bg-foreground/10 text-muted",
    value: "text-foreground",
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
 * Tonal KPI / summary card — Soft UI with accent wash (not flat white).
 */
function MetricCard({ label, value, hint, tone = "accent", icon, className = "" }: Props) {
  const t = toneClass[tone];
  return (
    <article
      className={`rounded-card p-5 shadow-extruded transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-extruded-hover ${t.card} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className={`font-display text-3xl font-extrabold tracking-tight ${t.value}`}>{value}</p>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
        {icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-inset-sm ${t.icon}`}>
            <Icon icon={icon} size={20} />
          </span>
        )}
      </div>
    </article>
  );
}

export default MetricCard;
