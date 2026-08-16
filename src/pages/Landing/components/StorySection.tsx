import { ArrowUpRight } from "lucide-react";
import { STORY } from "../content";
import { LANDING_IMAGES } from "../images";
import { LandingImage, LpButton, LpSection } from "./ui";

function StorySection() {
  return (
    <LpSection id="story">
      <div className="lp-story">
        <figure className="lp-story-shot">
          <LandingImage
            src={LANDING_IMAGES.about1}
            filename="about-gallery-1.png"
            alt="Câu chuyện hình thành IU CLUB"
          />
        </figure>
        <div className="lp-story-copy">
          <p className="lp-eyebrow">{STORY.eyebrow}</p>
          <h2 className="lp-h2">
            <span className="block">{STORY.headlineLead}</span>
            <span className="lp-h2-accent">{STORY.headlineAccent}</span>
          </h2>
          {STORY.paragraphs.map((paragraph) => (
            <p key={paragraph} className="lp-lead">
              {paragraph}
            </p>
          ))}
          <div className="lp-sec-cta">
            <LpButton href="#journey">
              {STORY.ctaPrimary}
              <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden />
            </LpButton>
          </div>
        </div>
        <ul className="lp-story-facts">
          {STORY.stats.map((stat) => (
            <li key={stat.value}>
              <p className="lp-story-fact-value">{stat.value}</p>
              <p className="lp-story-fact-label">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </LpSection>
  );
}

export default StorySection;
