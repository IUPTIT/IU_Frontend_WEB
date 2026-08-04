import {
  FileText,
  GraduationCap,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { StatCard, Tone } from "../../../types/admin";
import useCountUp from "../../../hooks/useCountUp";
import Icon from "../../../components/ui/Icon";
import type { MetricTone } from "../../../components/ui/MetricCard";

const toneToMetric: Record<Tone, MetricTone> = {
  accent: "accent",
  purple: "violet",
  green: "emerald",
  muted: "slate",
};

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

const icons: Record<StatCard["icon"], LucideIcon> = {
  file: FileText,
  chat: MessageSquare,
  graduation: GraduationCap,
  members: Users,
};

function StatCardItem({ card }: { card: StatCard }) {
  const value = useCountUp(card.value);
  const tone = toneToMetric[card.badgeTone] ?? "accent";
  const t = toneClass[tone];

  return (
    <article
      className={`rounded-card p-6 shadow-extruded transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-extruded-hover ${t.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inset-sm ${t.icon}`}>
          <Icon icon={icons[card.icon]} size={20} />
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.icon}`}>{card.badge}</span>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">{card.label}</p>
      <p className={`mt-1 font-display text-4xl font-extrabold tracking-tight ${t.value}`}>{value}</p>
    </article>
  );
}

function StatsCards({ cards }: { cards: StatCard[] }) {
  return (
    <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCardItem key={card.id} card={card} />
      ))}
    </section>
  );
}

export default StatsCards;
