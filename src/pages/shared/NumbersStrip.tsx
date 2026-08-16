import { Award, CalendarDays, FolderKanban, Swords, Users, type LucideIcon } from "lucide-react";
import { NUMBERS } from "../Landing/content";
import { CountUp } from "./CountUp";

const ICONS: LucideIcon[] = [Users, FolderKanban, CalendarDays, Swords, Award];

export function NumbersStrip() {
  return (
    <div className="lp-numbers">
      <header className="lp-sec-head">
        <p className="lp-eyebrow">{NUMBERS.eyebrow}</p>
        <h2 className="lp-h2">{NUMBERS.headline}</h2>
      </header>
      <div className="lp-num-panel">
        {NUMBERS.items.map((item, index) => {
          const Icon = ICONS[index];
          return (
            <article key={item.label} className="lp-num-cell">
              <span className="lp-num-orb" aria-hidden>
                {Icon ? <Icon className="lp-icon-neon" /> : null}
              </span>
              <p className="lp-stat-n">
                <CountUp to={item.value} suffix={item.suffix} delay={index * 140} />
              </p>
              <p className="lp-body">{item.label}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
