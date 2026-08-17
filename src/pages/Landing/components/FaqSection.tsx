import { useState } from "react";
import { FAQ } from "../content";
import { LpButton, LpSection } from "./ui";

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <LpSection id="faq">
      <div className="lp-faq">
        <header className="lp-sec-head">
          <p className="lp-eyebrow">{FAQ.eyebrow}</p>
          <h2 className="lp-h2">
            BẠN ĐANG THẮC MẮC
            <span className="lp-h2-accent">ĐIỀU GÌ?</span>
          </h2>
        </header>

        <div className="lp-faq-list mt-10">
          {FAQ.items.map((item, index) => {
            const isOpen = open === index;
            const panelId = `faq-a-${index}`;
            const btnId = `faq-q-${index}`;
            return (
              <div key={item.q} className={`lp-faq-item ${isOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  id={btnId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span>{item.q}</span>
                  <span className="lp-faq-plus" aria-hidden>
                    +
                  </span>
                </button>
                <div className="lp-faq-a" id={panelId} role="region" aria-labelledby={btnId} aria-hidden={!isOpen}>
                  <p className="lp-body">{item.a}</p>
                </div>
              </div>
            );
          })}
          <div className="lp-sec-cta">
            <LpButton href="#faq">{FAQ.cta}</LpButton>
          </div>
        </div>
      </div>
    </LpSection>
  );
}

export default FaqSection;
