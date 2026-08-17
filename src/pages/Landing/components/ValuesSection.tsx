import { Sparkles, BookOpen, Lightbulb, Users, TrendingUp, type LucideIcon } from "lucide-react";
import { VALUES } from "../content";
import { LpIcon, LpSection } from "./ui";

const ICONS: LucideIcon[] = [Sparkles, BookOpen, Lightbulb, Users, TrendingUp];

function ValuesSection() {
  return (
    <LpSection id="values">
      <header className="lp-sec-head">
        <p className="lp-eyebrow">{VALUES.eyebrow}</p>
        <h2 className="lp-h2">{VALUES.headline}</h2>
      </header>
      <div className="lp-values">
        {VALUES.items.map((item, index) => {
          const Icon = ICONS[index];
          return (
            <article key={item.title} className="lp-value-card">
              <LpIcon icon={Icon} />
              <h3 className="lp-h3">{item.title}</h3>
              <p className="lp-body">{item.body}</p>
            </article>
          );
        })}
      </div>
    </LpSection>
  );
}

export default ValuesSection;
