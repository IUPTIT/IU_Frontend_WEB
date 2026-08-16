import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Clock3, MapPin, Mic2, Swords, Users, Wrench, type LucideIcon } from "lucide-react";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LandingNavBar from "../../components/LandingNavBar";
import LandingFooter from "../../components/LandingFooter";
import { LandingImage, LpButton, LpSection } from "../Landing/components/ui";
import { assetUrl, LANDING_IMAGES } from "../Landing/images";
import { PublicPageHero } from "../shared/PublicPageHero";
import { EVENT_GALLERY, EVENT_HERO, EVENT_JOIN, EVENT_NEXT, EVENT_TYPES, EVENT_YEAR } from "./content";
import "../../styles/landing.css";
import "../../styles/landing-home.css";
import "../../styles/about-club.css";
import "../../styles/public-pages.css";

const TYPE_ICONS: LucideIcon[] = [Wrench, Swords, Mic2, Users];
const EVENT_PHOTOS = [...LANDING_IMAGES.activities, ...LANDING_IMAGES.achievements];

function eventPhoto(file: string) {
  return EVENT_PHOTOS.find((item) => item.file === file)?.src ?? assetUrl(file);
}

function eventBadge(date: string) {
  const [day, month] = date.split("/");
  return { day, month: `TH${month}` };
}

function SecHead({ eyebrow, headline }: { eyebrow: string; headline: string }) {
  return (
    <header className="lp-sec-head">
      <p className="lp-eyebrow">{eyebrow}</p>
      <h2 className="lp-h2">{headline}</h2>
    </header>
  );
}

function SuKienPage() {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(EVENT_GALLERY.items.length / EVENT_GALLERY.perPage);
  const visible = useMemo(() => {
    const start = page * EVENT_GALLERY.perPage;
    return EVENT_GALLERY.items.slice(start, start + EVENT_GALLERY.perPage);
  }, [page]);

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
          id="su-kien-hero"
          eyebrow={EVENT_HERO.eyebrow}
          headline={EVENT_HERO.headline}
          tagline={EVENT_HERO.tagline}
          cta={EVENT_HERO.cta}
          ctaHref="#chuong-trinh"
          images={[
            ...LANDING_IMAGES.activities.map((item) => item.src),
            ...LANDING_IMAGES.aboutHero.map((item) => item.src),
          ].filter(Boolean) as string[]}
        />

        <LpSection id="chuong-trinh">
          <SecHead eyebrow={EVENT_GALLERY.eyebrow} headline={EVENT_GALLERY.headline} />
          <p className="lp-sec-intro lp-lead">{EVENT_GALLERY.intro}</p>
          <div className="pg-board">
            {visible.map((item) => {
              const badge = eventBadge(item.date);
              return (
                <article key={item.title} className="lp-card pg-board-card">
                  <figure className="pg-board-shot">
                    <LandingImage src={eventPhoto(item.file)} filename={item.file} alt={item.title} />
                    <p className="pg-board-date">
                      <span>{badge.day}</span>
                      <span>{badge.month}</span>
                    </p>
                  </figure>
                  <div className="pg-board-body">
                    <p className="pg-board-when">
                      <Clock3 size={14} strokeWidth={2.2} aria-hidden />
                      <span>
                        {item.date} {item.time}
                      </span>
                    </p>
                    <h3 className="pg-board-title">{item.title}</h3>
                    <p className="pg-board-place">
                      <MapPin size={14} strokeWidth={2.2} aria-hidden />
                      <span>{item.place}</span>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
          {pageCount > 1 ? (
            <nav className="pg-pager" aria-label="Trang sự kiện">
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === page ? "is-on" : ""}
                  aria-label={`Trang ${index + 1}`}
                  aria-current={index === page ? "page" : undefined}
                  onClick={() => setPage(index)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                type="button"
                aria-label="Trang sau"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              >
                <ChevronRight size={16} strokeWidth={2.4} />
              </button>
            </nav>
          ) : null}
        </LpSection>

        <LpSection id="dang-su-kien">
          <SecHead eyebrow={EVENT_TYPES.eyebrow} headline={EVENT_TYPES.headline} />
          <p className="lp-sec-intro lp-lead">{EVENT_TYPES.intro}</p>
          <div className="pg-types">
            {EVENT_TYPES.items.map((item, index) => {
              const Icon = TYPE_ICONS[index];
              return (
                <article key={item.title} className="lp-card lp-card-static pg-type">
                  <p className="pg-type-n">{item.n}</p>
                  <span className="lp-ico" aria-hidden>
                    {Icon ? <Icon className="lp-icon-neon" /> : null}
                  </span>
                  <h3 className="lp-h3">{item.title}</h3>
                  <p className="lp-body">{item.body}</p>
                </article>
              );
            })}
          </div>
        </LpSection>

        <LpSection id="lich-nam">
          <SecHead eyebrow={EVENT_YEAR.eyebrow} headline={EVENT_YEAR.headline} />
          <p className="lp-sec-intro lp-lead">{EVENT_YEAR.intro}</p>
          <ol className="pg-seasons">
            {EVENT_YEAR.seasons.map((item, index) => (
              <li key={item.title}>
                <p className="pg-season-when">{item.when}</p>
                <span className="pg-season-dot" aria-hidden>
                  0{index + 1}
                </span>
                <article className="lp-card lp-card-static pg-season-card">
                  <h3 className="lp-h3">{item.title}</h3>
                  <p className="lp-body">{item.body}</p>
                </article>
              </li>
            ))}
          </ol>
        </LpSection>

        <LpSection id="tham-gia-sk">
          <SecHead eyebrow={EVENT_JOIN.eyebrow} headline={EVENT_JOIN.headline} />
          <div className="pg-join-cards">
            {EVENT_JOIN.points.map((point, index) => (
              <article key={point.title} className="lp-card lp-card-static pg-join-card">
                <CalendarDays className="pg-join-ico" size={18} strokeWidth={2.2} aria-hidden />
                <p className="ab-unit-num">0{index + 1}</p>
                <h3 className="lp-h3">{point.title}</h3>
                <p className="lp-body">{point.body}</p>
              </article>
            ))}
          </div>
        </LpSection>

        <LpSection id="tham-gia" className="ab-finale">
          <div className="ab-join">
            <figure className="ab-join-media">
              {LANDING_IMAGES.activities[4]?.src ? (
                <img
                  src={LANDING_IMAGES.activities[4].src}
                  alt="Sinh nhật IU CLUB"
                  width={1200}
                  height={800}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </figure>
            <div className="ab-join-copy">
              <p className="lp-eyebrow">{EVENT_NEXT.eyebrow}</p>
              <h2 className="lp-h2">{EVENT_NEXT.headline}</h2>
              <p className="lp-lead pg-next-lead">{EVENT_NEXT.body}</p>
              <p className="ab-finale-line">{EVENT_NEXT.closer}</p>
              <div className="ab-join-cta">
                <LpButton to="/tuyen-thanh-vien">{EVENT_NEXT.ctaJoin}</LpButton>
                <LpButton variant="ghost" to="/dao-tao">
                  {EVENT_NEXT.ctaTrain}
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

export default SuKienPage;
