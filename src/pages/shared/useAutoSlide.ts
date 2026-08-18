import { useEffect, useState } from "react";

const AUTO_MS = 5000;

export function useAutoSlide(count: number, ms = AUTO_MS) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (count < 2 || paused || reduce) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, ms);
    return () => window.clearInterval(timer);
  }, [count, paused, ms]);

  const go = (next: number) => {
    if (count < 1) return;
    setIndex(((next % count) + count) % count);
  };

  return { index, setIndex, paused, setPaused, go, ms };
}
