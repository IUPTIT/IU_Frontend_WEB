import { ArrowRight } from "lucide-react";
import { useLayoutEffect } from "react";
import { HERO } from "../content";
import { LANDING_IMAGES } from "../images";
import { LpButton } from "./ui";
import { CountdownCard, useCountdown } from "./HeroCountdown";

function HeroFx() {
  const ribbon =
    "M 0 900 C 220 892, 460 910, 720 868 C 880 838, 940 680, 968 400 C 988 180, 996 50, 1010 -40";
  const fibers = [
    { d: "M 0 900 C 220 892, 460 910, 720 868 C 880 838, 940 680, 968 400 C 988 180, 996 50, 1010 -40", w: 7, color: "#e879f9", o: 0.35 },
    { d: "M 8 896 C 230 888, 470 906, 728 864 C 886 834, 946 676, 972 396 C 990 176, 998 46, 1012 -44", w: 2.4, color: "#f9a8d4", o: 0.85 },
    { d: "M 0 904 C 210 896, 450 914, 710 872 C 874 842, 934 684, 964 404 C 986 184, 994 54, 1008 -36", w: 1.5, color: "#fff", o: 0.7 },
    { d: "M 18 898 C 240 890, 480 908, 736 862 C 892 832, 950 670, 976 392 C 992 172, 1000 42, 1014 -48", w: 0.9, color: "#f0abfc", o: 0.75 },
    { d: "M -6 908 C 200 900, 440 918, 700 876 C 868 846, 928 690, 960 410 C 982 190, 990 60, 1006 -32", w: 0.7, color: "#db2777", o: 0.55 },
    { d: "M 30 892 C 250 884, 490 902, 744 858 C 898 828, 954 664, 978 388 C 994 168, 1002 38, 1016 -52", w: 0.55, color: "#f472b6", o: 0.5 },
  ];
  const fat = "M 240 902 C 420 908, 560 896, 700 870";

  return (
    <div className="lp-hero-fx" aria-hidden>
        {LANDING_IMAGES.logoMark ? (
        <img src={LANDING_IMAGES.logoMark} alt="" className="lp-hero-logo" decoding="async" loading="lazy" />
      ) : null}
      <svg className="lp-hero-streaks" viewBox="0 0 1000 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lp-fx" gradientUnits="userSpaceOnUse" x1="0" y1="900" x2="1010" y2="-40">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.15" />
            <stop offset="18%" stopColor="#e879f9" />
            <stop offset="42%" stopColor="#fda4af" />
            <stop offset="58%" stopColor="#fff" />
            <stop offset="82%" stopColor="#f0abfc" />
            <stop offset="100%" stopColor="#db2777" stopOpacity="0.25" />
          </linearGradient>
          <filter id="lp-fx-soft" x="-40%" y="-140%" width="180%" height="380%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="lp-fx-mid" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        <path d={ribbon} fill="none" stroke="url(#lp-fx)" strokeWidth="11" strokeLinecap="round" filter="url(#lp-fx-soft)" opacity="0.55" />
        <path d={fat} fill="none" stroke="#f472b6" strokeWidth="14" strokeLinecap="round" filter="url(#lp-fx-soft)" opacity="0.45" />
        <path d={fat} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.55" />

        {fibers.map((line) => (
          <path
            key={line.d + line.w}
            d={line.d}
            fill="none"
            stroke={line.color}
            strokeWidth={line.w}
            strokeLinecap="round"
            opacity={line.o}
          />
        ))}
      </svg>
    </div>
  );
}

function HeroRecruitTimer() {
  const { campaign, state } = useCountdown();
  if (state.kind !== "running" && state.kind !== "before") return null;
  return (
    <div className="lp-hero-cd">
      <CountdownCard state={state} campaign={campaign} variant="compact" />
    </div>
  );
}

function HeroSection() {
  const banner = LANDING_IMAGES.bannerMobile ?? LANDING_IMAGES.banner;
  const bannerFull = LANDING_IMAGES.banner;
  const srcSet =
    banner && bannerFull && banner !== bannerFull ? `${banner} 960w, ${bannerFull} 1600w` : undefined;

  useLayoutEffect(() => {
    if (!banner) return;
    let link = document.head.querySelector('link[data-lcp-banner]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.setAttribute("data-lcp-banner", "1");
      document.head.appendChild(link);
    }
    link.href = banner;
    if (srcSet) {
      link.imageSrcset = srcSet;
      link.imageSizes = "100vw";
    }
    link.fetchPriority = "high";
  }, [banner, srcSet]);

  return (
    <section id="hero" className="lp-hero scroll-mt-0">
      <div className="lp-hero-media" aria-hidden>
        {banner ? (
          <img
            src={banner}
            srcSet={srcSet}
            sizes="100vw"
            alt=""
            className="lp-hero-banner"
            width={960}
            height={540}
            decoding="async"
            fetchPriority="high"
          />
        ) : null}
      </div>
      <div className="lp-hero-veil" aria-hidden />
      <HeroFx />

      <div className="lp-hero-copy-wrap lp-reveal is-in">
        <div className="lp-hero-copy">
          <p className="lp-hero-kicker">{HERO.kicker}</p>
          <h1 className="lp-hero-title">
            <span>SHINE AND</span>
            <span>THRIVE</span>
          </h1>
          <p className="lp-hero-sub">{HERO.subheadline}</p>
          {HERO.paragraphs.map((paragraph) => (
            <p key={paragraph} className="lp-hero-desc">
              {paragraph}
            </p>
          ))}
          <div className="lp-hero-actions">
            <LpButton href="#about">
              {HERO.ctaPrimary}
              <span className="lp-btn-arrow" aria-hidden>
                <ArrowRight size={13} strokeWidth={2.5} />
              </span>
            </LpButton>
            <LpButton variant="ghost" to="/tuyen-thanh-vien">
              {HERO.ctaSecondary}
            </LpButton>
          </div>
          <HeroRecruitTimer />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
