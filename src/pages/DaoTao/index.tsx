import { useEffect } from "react";
import { BookOpen, Brain, Code2, Database, FolderKanban, Puzzle, type LucideIcon } from "lucide-react";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LandingNavBar from "../../components/LandingNavBar";
import LandingFooter from "../../components/LandingFooter";
import { LpButton, LpSection } from "../Landing/components/ui";
import { LANDING_IMAGES } from "../Landing/images";
import { PublicPageHero } from "../shared/PublicPageHero";
import { TRAIN_HERO, TRAIN_HOW, TRAIN_NEXT, TRAIN_ROADMAP, TRAIN_SKILLS } from "./content";
import "../../styles/landing.css";
import "../../styles/landing-home.css";
import "../../styles/about-club.css";
import "../../styles/public-pages.css";

const SKILL_ICONS: LucideIcon[] = [Code2, BookOpen, Brain, Database, Puzzle, FolderKanban];
const CHAPTER_SHOTS = LANDING_IMAGES.trainChapters;

function SecHead({ eyebrow, headline }: { eyebrow: string; headline: string }) {
  return (
    <header className="lp-sec-head">
      <p className="lp-eyebrow">{eyebrow}</p>
      <h2 className="lp-h2">{headline}</h2>
    </header>
  );
}

function DaoTaoPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="landing-theme lp-home relative min-h-screen">
      <BackgroundVideo />
      <div className="lp-page-veil" />
      <div className="relative z-10">
        <LandingNavBar />
        <main id="main">
        <PublicPageHero
          id="dao-tao-hero"
          eyebrow={TRAIN_HERO.eyebrow}
          headline={TRAIN_HERO.headline}
          tagline={TRAIN_HERO.tagline}
          cta={TRAIN_HERO.cta}
          ctaHref="#lo-trinh"
          images={[
            ...LANDING_IMAGES.trainChapters,
            ...LANDING_IMAGES.activities.map((item) => item.src),
          ].filter(Boolean) as string[]}
        />

        <LpSection id="kien-thuc">
          <SecHead eyebrow={TRAIN_SKILLS.eyebrow} headline={TRAIN_SKILLS.headline} />
          <p className="lp-sec-intro lp-lead">{TRAIN_SKILLS.intro}</p>
          <div className="pg-skills">
            {TRAIN_SKILLS.items.map((item, index) => {
              const Icon = SKILL_ICONS[index];
              return (
                <article key={item.title} className="lp-card pg-skill">
                  <span className="lp-ico" aria-hidden>
                    {Icon ? <Icon className="lp-icon-neon" strokeWidth={1.75} /> : null}
                  </span>
                  <div className="pg-skill-copy">
                    <h3 className="lp-h3">{item.title}</h3>
                    <p className="lp-body">{item.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </LpSection>

        <LpSection id="lo-trinh">
          <SecHead eyebrow={TRAIN_ROADMAP.eyebrow} headline={TRAIN_ROADMAP.headline} />
          <p className="lp-sec-intro lp-lead">{TRAIN_ROADMAP.intro}</p>
          <ol className="pg-chapters">
            {TRAIN_ROADMAP.steps.map((step, index) => (
              <li key={step.n} className={index % 2 ? "is-flip" : ""}>
                <figure className="pg-chapter-shot">
                  {CHAPTER_SHOTS[index] ? (
                    <img
                      src={CHAPTER_SHOTS[index]}
                      alt={step.title}
                      width={1200}
                      height={800}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </figure>
                <span className="pg-chapter-node" aria-hidden>
                  {step.n}
                </span>
                <article className="pg-chapter-copy">
                  <p className="pg-chapter-when">{step.when}</p>
                  <h3 className="lp-h3">{step.title}</h3>
                  <p className="lp-body">{step.body}</p>
                </article>
              </li>
            ))}
          </ol>
        </LpSection>

        <LpSection id="van-hanh">
          <SecHead eyebrow={TRAIN_HOW.eyebrow} headline={TRAIN_HOW.headline} />
          <div className="pg-flow">
            <ol className="pg-flow-track" aria-hidden>
              {TRAIN_HOW.items.map((_, index) => (
                <li key={`step-${index}`}>
                  <span>0{index + 1}</span>
                </li>
              ))}
            </ol>
            <ol className="pg-flow-cards">
              {TRAIN_HOW.items.map((item, index) => (
                <li key={item.title}>
                  <article className="lp-card pg-flow-card">
                    <p className="pg-flow-n">0{index + 1}</p>
                    <h3 className="lp-h3">{item.title}</h3>
                    <p className="lp-body">{item.body}</p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </LpSection>

        <LpSection id="tham-gia" className="ab-finale">
          <div className="ab-join">
            <figure className="ab-join-media">
              {LANDING_IMAGES.activities[0]?.src ? (
                <img
                  src={LANDING_IMAGES.activities[0].src}
                  alt="Buổi đào tạo thành viên mới IU CLUB"
                  width={1200}
                  height={800}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </figure>
            <div className="ab-join-copy">
              <p className="lp-eyebrow">{TRAIN_NEXT.eyebrow}</p>
              <h2 className="lp-h2">{TRAIN_NEXT.headline}</h2>
              <p className="lp-lead pg-next-lead">{TRAIN_NEXT.body}</p>
              <p className="ab-finale-line">{TRAIN_NEXT.closer}</p>
              <div className="ab-join-cta">
                <LpButton to="/tuyen-thanh-vien">{TRAIN_NEXT.ctaJoin}</LpButton>
                <LpButton variant="ghost" to="/su-kien">
                  {TRAIN_NEXT.ctaEvents}
                </LpButton>
              </div>
            </div>
          </div>
        </LpSection>
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}

export default DaoTaoPage;
