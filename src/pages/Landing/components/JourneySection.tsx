import { JOURNEY } from "../content";
import { LpSection } from "./ui";

function JourneySection() {
  return (
    <LpSection id="journey">
      <header className="lp-sec-head">
        <p className="lp-eyebrow">{JOURNEY.eyebrow}</p>
        <h2 className="lp-h2">{JOURNEY.headline}</h2>
      </header>
      <ol className="lp-zigzag">
        {JOURNEY.items.map((item, index) => (
          <li
            key={item.year}
            className={`lp-zigzag-item ${index % 2 === 0 ? "is-left" : "is-right"}`}
          >
            <span className="lp-zigzag-dot" aria-hidden />
            <article className="lp-zigzag-card">
              <p className="lp-journey-year">{item.year}</p>
              <h3 className="lp-h3">{item.title}</h3>
              <p className="lp-body">{item.body}</p>
            </article>
          </li>
        ))}
      </ol>
    </LpSection>
  );
}

export default JourneySection;
