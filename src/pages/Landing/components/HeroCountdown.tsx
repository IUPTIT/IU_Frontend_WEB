import { useEffect, useState } from "react";
import { ACTIVE_CAMPAIGN } from "../../Recruitment/mockData";

type CountdownState =
  | { kind: "not_started" }
  | { kind: "ended" }
  | { kind: "running"; days: number; hours: number; minutes: number };

function computeState(): CountdownState {
  const now = Date.now();
  if (now < new Date(ACTIVE_CAMPAIGN.openAt).getTime()) return { kind: "not_started" };
  const diff = new Date(ACTIVE_CAMPAIGN.closeAt).getTime() - now;
  if (diff <= 0) return { kind: "ended" };
  return {
    kind: "running",
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
  };
}

function HeroCountdown() {
  const [state, setState] = useState<CountdownState>(computeState);

  useEffect(() => {
    const timer = window.setInterval(() => setState(computeState()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (state.kind !== "running") {
    return (
      <div className="liquid-glass landing-card-solid rounded-2xl px-5 py-3">
        <p className="text-sm font-medium text-[hsl(var(--landing-foreground)/0.8)]">
          {state.kind === "ended" ? "Đã hết thời gian đăng ký" : "Chưa đến thời gian đăng ký"}
        </p>
      </div>
    );
  }

  return (
    <div className="liquid-glass landing-card-solid flex items-center gap-2 rounded-2xl px-4 py-3">
      {[
        { value: state.days, unit: "ngày" },
        { value: state.hours, unit: "giờ" },
        { value: state.minutes, unit: "phút" },
      ].map(({ value, unit }) => (
        <div key={unit} className="rounded-xl bg-white/[0.07] px-3.5 py-2 text-center">
          <p className="landing-display text-xl font-semibold text-[hsl(var(--landing-foreground))]">
            {String(value).padStart(2, "0")}
          </p>
          <p className="text-[11px] text-[hsl(var(--landing-foreground)/0.5)]">{unit}</p>
        </div>
      ))}
      <p className="ml-1 max-w-[90px] text-xs leading-snug text-[hsl(var(--landing-foreground)/0.7)]">
        đến khi đóng đơn
      </p>
    </div>
  );
}

export default HeroCountdown;
