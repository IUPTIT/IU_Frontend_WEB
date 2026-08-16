import { useEffect, useState } from "react";
import { useInView } from "./useInView";

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

export function CountUp({
  to,
  suffix = "",
  duration = 1600,
  delay = 0,
  loop = true,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  delay?: number;
  loop?: boolean;
}) {
  const { ref, on } = useInView<HTMLSpanElement>(0.4);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!on) {
      setValue(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }

    let frame = 0;
    let start = 0;
    let waiting: number | undefined;
    let cancelled = false;

    const play = () => {
      start = 0;
      const tick = (now: number) => {
        if (cancelled) return;
        if (!start) start = now;
        const t = Math.min(1, (now - start) / duration);
        setValue(Math.round(to * easeOut(t)));
        if (t < 1) {
          frame = requestAnimationFrame(tick);
          return;
        }
        if (loop) {
          waiting = window.setTimeout(() => {
            setValue(0);
            waiting = window.setTimeout(play, 180);
          }, 3200);
        }
      };
      frame = requestAnimationFrame(tick);
    };

    const begin = window.setTimeout(play, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(begin);
      if (waiting) window.clearTimeout(waiting);
      cancelAnimationFrame(frame);
    };
  }, [on, to, duration, delay, loop]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}
