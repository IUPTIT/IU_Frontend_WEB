import { useEffect, useState } from "react";

/** Count-up số liệu KPI khi mount / khi value đổi (hỗ trợ số thập phân) */
function useCountUp(target: number, durationMs = 700, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const from = 0;
    const factor = 10 ** decimals;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round((from + (target - from) * eased) * factor) / factor);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, decimals]);

  return value;
}

export default useCountUp;
