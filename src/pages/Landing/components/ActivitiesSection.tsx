import { Code2, Brain, GraduationCap, CalendarDays, Camera, Handshake, type LucideIcon } from "lucide-react";
import { ACTIVITIES } from "../content";
import { LpButton, LpIcon, LpSection } from "./ui";

const ICONS: LucideIcon[] = [Code2, Brain, GraduationCap, CalendarDays, Camera, Handshake];

function ActivitiesSection() {
  return (
    <LpSection id="activities">
      <header className="lp-sec-head">
        <p className="lp-eyebrow">{ACTIVITIES.eyebrow}</p>
        <h2 className="lp-h2">{ACTIVITIES.headline}</h2>
      </header>
      <div className="lp-dir mt-10">
        {ACTIVITIES.bans.map((ban, index) => (
          <article key={ban.title}>
            <span className="lp-idx">{String(index + 1).padStart(2, "0")}</span>
            <LpIcon icon={ICONS[index]} />
            <div>
              <h3 className="lp-h3">{ban.title}</h3>
              <p className="lp-body mt-2">{ban.body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="lp-sec-cta">
        <LpButton to="/ve-iu-club">{ACTIVITIES.cta}</LpButton>
      </div>
    </LpSection>
  );
}

export default ActivitiesSection;
