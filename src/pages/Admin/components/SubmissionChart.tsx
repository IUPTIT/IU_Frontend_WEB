import { useState } from "react";
import type { WeeklySubmission } from "../../../types/admin";

const SERIES = [
  { key: "received" as const, label: "Hồ sơ nhận", color: "#6C63FF" },
  { key: "passed" as const, label: "Đạt vòng đơn", color: "#38B2AC" },
];

const W = 640;
const H = 280;
const PAD = { top: 16, right: 16, bottom: 40, left: 40 };

function SubmissionChart({ data }: { data: WeeklySubmission[] }) {
  const [range, setRange] = useState<"week" | "day">("week");
  const [hover, setHover] = useState<number | null>(null);

  const max = 100; // trần trục y khớp design (max data 102 → gridline 100)
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const groupW = plotW / data.length;
  const barW = Math.min(22, groupW / 3);
  const y = (v: number) => PAD.top + plotH - (Math.min(v, max) / max) * plotH;

  return (
    <article className="neu-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg">Tiến độ nộp hồ sơ</h3>
          <p className="mt-1 text-sm text-muted">Theo tuần – Tháng 9/2023</p>
        </div>
        <div className="flex rounded-2xl shadow-inset-sm p-1">
          {(["week", "day"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                range === r ? "text-accent shadow-extruded-sm" : "text-muted"
              }`}
            >
              {r === "week" ? "Tuần" : "Ngày"}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-6 w-full" role="img" aria-label="Biểu đồ cột hồ sơ nhận và đạt vòng đơn theo tuần">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="#A3B1C6" strokeOpacity="0.35" strokeWidth="1" />
            <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" className="fill-[#6B7280] text-[11px]">
              {v}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const cx = PAD.left + groupW * i + groupW / 2;
          const active = hover === i;
          return (
            <g
              key={d.week}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {/* hit target rộng hơn cột */}
              <rect x={PAD.left + groupW * i} y={PAD.top} width={groupW} height={plotH} fill="transparent" />
              {SERIES.map((s, si) => {
                const v = d[s.key];
                const x = cx - barW - 1 + si * (barW + 2); // 2px gap giữa 2 cột
                return (
                  <rect
                    key={s.key}
                    x={x}
                    y={y(v)}
                    width={barW}
                    height={PAD.top + plotH - y(v)}
                    rx="4"
                    fill={s.color}
                    opacity={hover === null || active ? 1 : 0.35}
                    style={{ transition: "opacity 300ms ease-out" }}
                  />
                );
              })}
              {active && (
                <g>
                  <rect x={cx - 56} y={PAD.top} width={112} height={44} rx="10" fill="#3D4852" />
                  <text x={cx} y={PAD.top + 18} textAnchor="middle" className="fill-white text-[11px] font-medium">
                    {d.week}
                  </text>
                  <text x={cx} y={PAD.top + 34} textAnchor="middle" className="fill-white text-[11px]">
                    Nhận {d.received} · Đạt {d.passed}
                  </text>
                </g>
              )}
              <text x={cx} y={H - 14} textAnchor="middle" className="fill-[#6B7280] text-[12px]">
                {d.week}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex items-center justify-center gap-8">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-sm text-muted">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </article>
  );
}

export default SubmissionChart;
