import type { WizardStepId } from "../wizard/types";
import { WIZARD_STEPS } from "../wizard/types";

type Props = {
  current: WizardStepId;
  onChange: (step: WizardStepId) => void;
};

/** Stepper cố định — tab đang chọn đổi màu */
function CampaignWizardStepper({ current, onChange }: Props) {
  return (
    <nav aria-label="Các bước tạo đợt tuyển" className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
      {WIZARD_STEPS.map((step, index) => {
        const active = current === step.id;
        const done = current > step.id;

        return (
          <div key={step.id} className="flex items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => onChange(step.id)}
              aria-current={active ? "step" : undefined}
              className={`group flex flex-col items-center gap-2 rounded-2xl px-3 py-2 transition-all duration-300 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
                ${active ? "scale-105" : "hover:-translate-y-0.5"}`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-br from-[#F5B4C8] to-[#8BB7F0] text-white shadow-soft-sm"
                    : done
                      ? "bg-accent/20 text-accent shadow-hairline"
                      : "bg-background text-muted shadow-soft-sm"
                }`}
              >
                {done && !active ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M5 10.5 8.5 14 15 6.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  step.id
                )}
              </span>
              <span
                className={`text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                  active ? "text-foreground" : "text-muted group-hover:text-foreground"
                }`}
              >
                {step.label}
              </span>
            </button>

            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={`hidden h-0.5 w-8 sm:w-14 rounded-full transition-colors duration-300 sm:block ${
                  current > step.id ? "bg-accent/40" : "bg-muted/25"
                }`}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default CampaignWizardStepper;
