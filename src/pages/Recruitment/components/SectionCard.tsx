import type { ReactNode } from "react";

type Props = {
  /** Số thứ tự hiển thị trong chip gradient (01, 02...) */
  step: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  /** Trễ animation vào (giây) để các section trồi lên so le */
  delay?: number;
};

/** Khối một mục của form — card kính + chip số + eyebrow, khớp vibe landing. */
function SectionCard({ step, eyebrow, title, children, delay = 0 }: Props) {
  return (
    <section
      className="reg-rise liquid-glass landing-card-glass glass-shine rounded-3xl p-6 md:p-8"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="mb-6 flex items-center gap-4">
        <span className="reg-chip" aria-hidden>
          {step}
        </span>
        <div>
          <p className="reg-eyebrow">{eyebrow}</p>
          <h2 className="landing-headline text-lg font-semibold text-[hsl(var(--landing-foreground))] md:text-xl">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export default SectionCard;
