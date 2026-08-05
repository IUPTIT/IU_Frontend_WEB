import {
  CalendarDays,
  FileText,
  GraduationCap,
  MessageSquare,
  Star,
  TrendingUp,
  UserCheck,
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

const icons: Record<StatCard["icon"], LucideIcon> = {
  file: FileText,
  chat: MessageSquare,
  graduation: GraduationCap,
  members: Users,
  percent: TrendingUp,
  calendar: CalendarDays,
  star: Star,
  mentor: UserCheck,
};

function StatCardItem({ card }: { card: StatCard }) {
  const value = useCountUp(card.value, 700, card.decimals ?? 0);
  const tone = toneToMetric[card.badgeTone] ?? "accent";
  const t = toneClass[tone];
  const display = card.decimals ? value.toFixed(card.decimals) : value;

  return (
    <article className="neu-card neu-card-hover !p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.icon}`}>
          <Icon icon={icons[card.icon]} size={20} />
        </span>
        {card.badge && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.icon}`}>
            {card.badge}
          </span>
        )}
      </div>
      <p className={`stat-num mt-4 text-[2rem] leading-none ${t.value}`}>
        {display}
        {card.suffix ?? ""}
      </p>
      <p className="mt-1.5 text-sm font-medium text-muted">{card.label}</p>
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
