import { HIGHLIGHTS } from "../content";
import { LANDING_IMAGES } from "../images";
import { LandingImage, LpButton, LpSection } from "./ui";

function HighlightsSection() {
  return (
    <LpSection id="highlights">
      <header className="lp-sec-head">
        <p className="lp-eyebrow">{HIGHLIGHTS.eyebrow}</p>
        <h2 className="lp-h2">{HIGHLIGHTS.headline}</h2>
      </header>
      <div className="lp-acts mt-10">
        {HIGHLIGHTS.items.map((item, index) => {
          const photo = LANDING_IMAGES.activities[index];
          return (
            <article key={item.title} className="lp-act">
              <LandingImage
                src={photo?.src}
                filename={photo?.file ?? item.file}
                alt={item.title}
                className="lp-act-img"
              />
              <div className="lp-act-cap">
                <h3 className="lp-h3">{item.title}</h3>
                <p className="lp-body mt-1">{item.body}</p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="lp-sec-cta">
        <LpButton to="/dao-tao">{HIGHLIGHTS.cta}</LpButton>
      </div>
    </LpSection>
  );
}

export default HighlightsSection;
