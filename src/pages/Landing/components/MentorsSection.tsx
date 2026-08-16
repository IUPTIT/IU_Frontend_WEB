import { MENTORS } from "../content";
import { LANDING_IMAGES, MENTOR_FALLBACKS } from "../images";
import { LandingImage, LpButton, LpSection } from "./ui";

const PHOTOS = [
  { src: LANDING_IMAGES.mentor1, fallback: MENTOR_FALLBACKS[0], file: "Thầy phan lý huỳnh.png" },
  { src: LANDING_IMAGES.mentor2, fallback: MENTOR_FALLBACKS[1], file: "Thầy Trần Quang Đại.png" },
];

function MentorsSection() {
  return (
    <LpSection id="mentors">
      <div className="lp-mentors">
        <header className="lp-sec-head">
          <p className="lp-eyebrow">{MENTORS.group}</p>
          <h2 className="lp-h2">{MENTORS.headline}</h2>
        </header>
        <p className="lp-sec-intro lp-lead">{MENTORS.p1}</p>

        <div className="lp-mentors-grid">
          {MENTORS.people.map((person, index) => (
            <article key={person.name} className="lp-card lp-card-static lp-mentor-card">
              <LandingImage
                src={PHOTOS[index].src}
                fallbackSrc={PHOTOS[index].fallback}
                filename={PHOTOS[index].file}
                alt={person.name}
                className="lp-mentor-photo"
              />
              <div className="lp-mentor-meta">
                <h3 className="lp-h3">{person.name}</h3>
                <p className="lp-body">{person.title}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="lp-sec-cta">
          <LpButton href="#mentors">{MENTORS.cta}</LpButton>
        </div>
      </div>
    </LpSection>
  );
}

export default MentorsSection;
