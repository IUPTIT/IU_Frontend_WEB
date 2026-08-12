import { Check } from "lucide-react";

type Step = "form" | "review" | "done";

const STEPS: { key: Step; label: string }[] = [
  { key: "form", label: "Điền hồ sơ" },
  { key: "review", label: "Xem lại" },
  { key: "done", label: "Hoàn tất" },
];

/** Thanh tiến trình 3 bước — gradient chạy tới bước hiện tại. */
function StepRail({ current }: { current: Step }) {
  const activeIndex = STEPS.findIndex((s) => s.key === current);
  const fillPct = activeIndex === 0 ? 0 : (activeIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="reg-rise mx-auto mt-8 max-w-md" style={{ animationDelay: "0.05s" }}>
      <div className="relative">
        {/* Vạch nối chạy giữa tâm dot đầu và dot cuối (1/6 → 5/6 bề ngang) */}
        <div className="absolute left-[16.67%] right-[16.67%] top-[15px] reg-rail-track">
          <div className="reg-rail-fill" style={{ width: `${fillPct}%` }} />
        </div>

        <ol className="relative flex justify-between">
          {STEPS.map((s, i) => {
            const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "todo";
            return (
              <li key={s.key} className="flex flex-1 flex-col items-center gap-2">
                <span
                  className={`reg-dot ${state === "active" ? "is-active" : ""} ${
                    state === "done" ? "is-done" : ""
                  }`}
                  aria-current={state === "active" ? "step" : undefined}
                >
                  {state === "done" ? <Check size={15} strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={`text-xs font-medium ${
                    state === "todo"
                      ? "text-[hsl(var(--landing-foreground)/0.45)]"
                      : "text-[hsl(var(--landing-foreground)/0.9)]"
                  }`}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default StepRail;
