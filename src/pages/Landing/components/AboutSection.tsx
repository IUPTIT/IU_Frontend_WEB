import { ArrowUpRight, BookOpen, Handshake, Users, type LucideIcon } from "lucide-react";
import { ABOUT } from "../content";
import { LANDING_IMAGES } from "../images";
import { LandingImage, LpButton, LpSection } from "./ui";

const ABOUT_CARDS: { text: string; Icon: LucideIcon }[] = [
  { text: ABOUT.pillars[0], Icon: BookOpen },
  { text: ABOUT.pillars[1], Icon: Users },
  { text: ABOUT.pillars[2], Icon: Handshake },
  { text: ABOUT.highlight, Icon: BookOpen },
];

function AboutSection() {
  return (
    <LpSection id="about" className="lp-section-pack">
      <div className="lp-panel">
        <div className="lp-about-grid">
          <div className="lp-about-copy">
            <div className="lp-kicker-row">
              <span className="lp-num" aria-hidden>
                <Users />
              </span>
              <p className="lp-eyebrow">{ABOUT.eyebrow}</p>
            </div>
            <h2 className="lp-h2 mt-5">
              <span className="block">{ABOUT.headlineLead}</span>
              <span className="lp-h2-accent">{ABOUT.headlineAccent}</span>
            </h2>
            <span className="lp-title-underline" aria-hidden />
            <div className="mt-8">
              <LpButton href="#highlights">
                {ABOUT.cta}
                <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden />
              </LpButton>
            </div>
          </div>

          <div className="lp-about-pillars">
            <div className="lp-pillar-stack">
              {ABOUT_CARDS.map(({ text, Icon }) => (
                <article key={text} className="lp-pillar-row">
                  <span className="lp-ico" aria-hidden>
                    <Icon className="lp-icon-neon" />
                  </span>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="lp-about-photo">
            <div className="lp-cut-glow">
              <div className="lp-cut-frame">
                <LandingImage
                  src={LANDING_IMAGES.about1}
                  filename="about-gallery-1.png"
                  alt="Thành viên IU CLUB trong hoạt động cộng đồng"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LpSection>
  );
}

export default AboutSection;
