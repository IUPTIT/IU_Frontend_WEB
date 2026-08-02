import type { ReactNode } from "react";
import type { StatCard, Tone } from "../../../types/admin";

const badgeTone: Record<Tone, string> = {
  accent: "bg-accent/15 text-accent",
  purple: "bg-accent-light/20 text-accent",
  green: "bg-accent-secondary/15 text-accent-secondary",
  muted: "bg-muted/15 text-muted",
};

const icons: Record<StatCard["icon"], ReactNode> = {
  file: (
    <path d="M6 2h6l4 4v12H6V2Zm6 0v4h4" strokeLinejoin="round" />
  ),
  chat: (
    <path d="M3 4h14v9H8l-4 4v-4H3V4Z" strokeLinejoin="round" />
  ),
  graduation: (
    <path d="m10 3 8 4-8 4-8-4 8-4Zm-5 6.5V14c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5V9.5" strokeLinejoin="round" />
  ),
  members: (
    <>
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="14" cy="8" r="2" />
      <path d="M2.5 16a4.5 4.5 0 0 1 9 0M11.5 15.5a3.5 3.5 0 0 1 6 0" strokeLinecap="round" />
    </>
  ),
};

function StatsCards({ cards }: { cards: StatCard[] }) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.id} className="neu-card neu-card-hover p-6">
          <div className="flex items-start justify-between">
            <div className="neu-well-sm h-12 w-12 text-accent">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                {icons[card.icon]}
              </svg>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium shadow-inset-sm ${badgeTone[card.badgeTone]}`}>
              {card.badge}
            </span>
          </div>
          <p className="mt-5 text-sm text-muted">{card.label}</p>
          <p className="mt-1 font-display text-4xl font-extrabold tracking-tight">{card.value}</p>
        </article>
      ))}
    </section>
  );
}

export default StatsCards;
