import { ACHIEVEMENTS } from "../content";
import { LANDING_IMAGES } from "../images";
import { LandingImage, LpButton, LpSection } from "./ui";

function AchievementsSection() {
  const photos = LANDING_IMAGES.achievements;

  return (
    <LpSection id="achievements">
      <header className="lp-sec-head">
        <p className="lp-eyebrow">{ACHIEVEMENTS.eyebrow}</p>
        <h2 className="lp-h2">{ACHIEVEMENTS.headline}</h2>
      </header>

      <div className="lp-achieve mt-10">
        {ACHIEVEMENTS.featured.map((item, index) => (
          <article key={item.title} className="lp-card lp-card-static lp-achieve-card">
            <div className="lp-achieve-media">
              <LandingImage
                src={photos[index]?.src}
                filename={photos[index]?.file ?? item.title}
                alt={item.title}
                className="lp-achieve-img"
              />
            </div>
            <div className="lp-achieve-cap">
              <h3 className="lp-h3">{item.title}</h3>
              <p className="lp-body">{item.line2}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="lp-sec-cta">
        <LpButton href="#achievements">{ACHIEVEMENTS.cta}</LpButton>
      </div>
    </LpSection>
  );
}

export default AchievementsSection;
