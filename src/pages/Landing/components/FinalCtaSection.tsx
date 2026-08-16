import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MOMENTS } from "../content";
import { LANDING_IMAGES } from "../images";
import { LandingImage } from "./ui";

function FinalCtaSection() {
  return (
    <section id="join" className="lp-moments" aria-label={MOMENTS.title}>
      <div className="lp-moments-row">
        {LANDING_IMAGES.moments.map((shot) => (
          <Link key={shot.file} to="/tuyen-thanh-vien" className="lp-moments-shot" aria-label={MOMENTS.cta}>
            <LandingImage src={shot.src} filename={shot.file} alt="" />
            <span className="lp-moments-hover">
              <span className="lp-moments-arrow" aria-hidden>
                <ArrowRight size={22} strokeWidth={2.4} />
              </span>
              <span className="lp-moments-cta-title">{MOMENTS.title}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default FinalCtaSection;
