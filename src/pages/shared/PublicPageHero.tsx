import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { LpButton } from "../Landing/components/ui";
import { useAutoSlide } from "./useAutoSlide";

export function PublicPageHero({
  id,
  eyebrow,
  headline,
  tagline,
  lead,
  cta,
  ctaHref,
  images,
}: {
  id: string;
  eyebrow: string;
  headline: string;
  tagline: string;
  lead?: string;
  cta: string;
  ctaHref: string;
  images: string[];
}) {
  const slides = [...new Set(images.filter(Boolean))];
  const { index, setIndex, paused, setPaused, go, ms } = useAutoSlide(slides.length);
  const activeSrc = slides[index];

  return (
    <section id={id} className="ab-hero" aria-labelledby={`${id}-title`}>
      {activeSrc ? (
        <div
          className="ab-hero-blur"
          aria-hidden
          style={{ backgroundImage: `url(${activeSrc})` }}
        />
      ) : null}
      <div className="ab-hero-veil" aria-hidden />
      <div className="ab-hero-inner">
        <div className="ab-hero-copy lp-reveal is-in">
          <p className="lp-eyebrow">{eyebrow}</p>
          <h1 id={`${id}-title`} className="lp-h2">
            {headline}
          </h1>
          <p className="ab-hero-tag">{tagline}</p>
          {lead ? <p className="lp-lead">{lead}</p> : null}
          <div className="lp-sec-cta">
            <LpButton href={ctaHref}>
              {cta}
              <span className="lp-btn-arrow" aria-hidden>
                <ArrowRight size={13} strokeWidth={2.5} />
              </span>
            </LpButton>
          </div>
        </div>
        <div
          className={`ab-hero-stage ${paused ? "is-paused" : ""}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="ab-hero-frame">
            <div className="ab-hero-slides">
              {slides.map((src, slide) => {
                const active = slide === index;
                const nearby =
                  active ||
                  slide === (index + 1) % slides.length ||
                  slide === (index - 1 + slides.length) % slides.length;
                if (!nearby) return null;
                return (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    width={1600}
                    height={900}
                    className={`ab-hero-shot ${active ? "is-active" : ""}`}
                    loading={slide === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={slide === 0 ? "high" : "low"}
                  />
                );
              })}
            </div>
            {slides.length > 1 ? (
              <>
                <span className="ab-hero-progress" key={index} style={{ animationDuration: `${ms}ms` }} />
                <button
                  type="button"
                  className="ab-hero-arrow is-prev"
                  aria-label="Ảnh trước"
                  onClick={() => go(index - 1)}
                >
                  <ChevronLeft size={22} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  className="ab-hero-arrow is-next"
                  aria-label="Ảnh sau"
                  onClick={() => go(index + 1)}
                >
                  <ChevronRight size={22} strokeWidth={2.4} />
                </button>
                <div className="ab-hero-dots" role="tablist" aria-label="Chọn ảnh">
                  {slides.map((src, dot) => (
                    <button
                      key={src}
                      type="button"
                      role="tab"
                      className={dot === index ? "is-active" : ""}
                      aria-label={`Ảnh ${dot + 1}`}
                      aria-selected={dot === index}
                      tabIndex={dot === index ? 0 : -1}
                      onClick={() => setIndex(dot)}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
