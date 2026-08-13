import { useState } from "react";
import type { TraineeDepartment, Tone } from "../../../types/admin";

const toneColor: Record<Tone, string> = {
  accent: "#6C63FF",
  purple: "#8B84FF",
  green: "#38B2AC",
  muted: "#6B7280",
};

const R = 70;
const STROKE = 26;
const SIZE = (R + STROKE) * 2;
const C = 2 * Math.PI * R;
const GAP = 3; // px khoảng hở giữa các cung

function TraineeDonut({ departments, total }: { departments: TraineeDepartment[]; total: number }) {
  const [hover, setHover] = useState<string | null>(null);

  const segments = departments.map((d, i) => {
    const len = (d.percent / 100) * C;
    const offset = departments
      .slice(0, i)
      .reduce((acc, prev) => acc - (prev.percent / 100) * C, 0);
    return { ...d, dash: `${Math.max(len - GAP, 1)} ${C - len + GAP}`, offset };
  });

  return (
    <article className="ui-card">
      <h3 className="text-lg">Cơ cấu Trainee</h3>
      <p className="mt-1 text-sm text-muted">Phân bổ theo Ban chuyên môn</p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-10">
        <div className="relative">
          <div className="ui-well rounded-full h-48 w-48">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-44 w-44 -rotate-90" role="img" aria-label="Biểu đồ tròn cơ cấu trainee theo ban">
              {segments.map((s) => (
                <circle
                  key={s.id}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  stroke={toneColor[s.tone]}
                  strokeWidth={hover === s.id ? STROKE + 4 : STROKE}
                  strokeDasharray={s.dash}
                  strokeDashoffset={s.offset}
                  opacity={hover === null || hover === s.id ? 1 : 0.35}
                  style={{ transition: "opacity 300ms ease-out, stroke-width 300ms ease-out" }}
                  onMouseEnter={() => setHover(s.id)}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
            </svg>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-display text-3xl font-extrabold">{total}</span>
            <span className="text-xs text-muted">Tổng số</span>
          </div>
        </div>

        <ul className="w-full space-y-4">
          {departments.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-3 text-sm"
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: toneColor[d.tone] }} />
              <span className="text-foreground">{d.label}</span>
              <span className="ml-auto font-display font-bold">{d.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default TraineeDonut;
